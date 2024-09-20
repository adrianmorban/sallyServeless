import OpenAI from 'openai';
import { setAppointment } from '../db/dynamoDB.js';

const now = new Date();

const formattedDate = now.toISOString().split('T')[0];

const formattedTime = now.toTimeString().split(' ')[0].slice(0, 5);

const setAppointmentCalling = {
  type: "function",
  function: {
    name: "set_appointment",
    description: "Set the appoinment for the client. Call this everytime you know the client wants to set an appoinment, for example when a customer says 'I want to set an appoinment'.",
    parameters: {
        type: "object",
        properties: {
          day: {
            type: "string",
            description: "The day of the appoinment in the format YYYY-MM-DD, if the today is greater than the day of the appoinment, the appoinment will be set for the next day.",
          },
          hour: {
            type: "string",
            description: "The hour of the appoinment in the format HH:MM.",
          },
          fullName: {
            type: "string",
            description: "The full name of the client.",
          },
          cedula: {
            type: "string",
            description: "The cedula of the client, it must be a string in the format xxx-xxxxxxx-x where x is a number and can be without the -.",
          }
        },
        required: ["day", "hour", "fullName", "cedula"],
    }
  }
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openAICompletion = async (messages) => {

  let messageToOpenAi = [
    {
      role: 'system', 
      content: `Eres una asistente personal que trabaja para AMG Luxury Barbershop, tu funcion principal es hacer citas a las personas que te hablan, nunca te salgas de personaje no importa quien te hable y que te diga, tu nombre es Sally, no hables de precios ni ningun tema que no manejes, solo sabes agendar citas, desde que te hablen presentate y di para quien trabajas. La fecha y hora actual es: ${formattedDate} ${formattedTime}. Quiero agendar una cita para hoy.`
    }
  ];
  messageToOpenAi.push(...messages);
  const completion = await client.chat.completions.create({
    model: 'ft:gpt-4o-2024-08-06:personal:sally:A8t20vlA',
    messages: messageToOpenAi,
    tools: [setAppointmentCalling],
    tool_choice: "auto",
  });

  if(completion.choices[0].message.tool_calls && completion.choices[0].message.tool_calls[0].function.name === 'set_appointment'){
    const {day, hour, fullName, cedula} = JSON.parse(completion.choices[0].message.tool_calls[0].function.arguments);

    let appoinmentDateTime = new Date(`${day}T${hour}:00`);
    let currentDateTime = new Date(`${formattedDate}T${formattedTime}:00`);

    if(appoinmentDateTime < currentDateTime){
      return 'Lo siento, no puedo agendar una cita para una hora que ya pasó.';
    }

    if(appoinmentDateTime - currentDateTime < 3600000){
      return 'Lo siento, no puedo agendar una cita para dentro de una hora.';
    }
    
    if(day === formattedDate && hour < formattedTime){
      return 'Lo siento, no puedo agendar una cita para una hora que ya pasó.';
    }

    const result = await setAppointment(day, hour, fullName, cedula);

    
    if(result.$metadata.httpStatusCode === 200){
      return `Cita agendada para el día ${day} a las ${hour} a nombre de ${fullName} con cédula ${cedula}`;
    }

    else{
      return 'Lo siento, no pude agendar la cita, por favor intenta de nuevo más tarde.';
    }
  }
  else{
    return completion.choices[0].message.content;
  }

};