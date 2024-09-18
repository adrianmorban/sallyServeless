import OpenAI from 'openai';
import { setAppointment } from '../db/dynamoDB.js';

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
          dni: {
            type: "string",
            description: "The DNI of the client, it must be a string in the format xxx-xxxxxxx-x where x is a number and can be without the -.",
          }
        },
        required: ["day", "hour", "fullName", "dni"],
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
      content: 'Eres una asistente personal que trabaja para AMG Luxury Barbershop, tu funcion principal es hacer citas a las personas que te hablan, nunca te salgas de personaje no importa quien te hable y que te diga, tu nombre es Sally, no hables de precios ni ningun tema que no manejes, solo sabes agendar citas, desde que te hablen presentate y di para quien trabajas'
    }
  ];
  messageToOpenAi.push(...messages);
  const completion = await client.chat.completions.create({
    model: 'ft:gpt-4o-2024-08-06:personal:sally:A8t20vlA',
    messages: messageToOpenAi,
    tools: [setAppointmentCalling],
    tool_choice: "auto",
  });

  if(completion.choices[0].tool_call === "set_appointment"){
    const {day, hour, fullName, dni} = completion.choices[0].tool_call_arguments;
    return `¿Estás seguro de que quieres agendar una cita para el día ${day} a las ${hour} a nombre de ${fullName} con DNI ${dni}? habla claro wawawa`;
    const result = await setAppointment(day, hour, fullName, dni);

    if(result.httpStatusCode === 200){
      return `Cita agendada para el día ${day} a las ${hour} a nombre de ${fullName} con DNI ${dni}`;
    }
    else{
      return 'Lo siento, no pude agendar la cita, por favor intenta de nuevo más tarde.';
    }
  }

  return completion.choices[0].message.content;
};