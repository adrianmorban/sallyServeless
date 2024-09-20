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
            description: "The cedula of the client, it must be a string in the format xxx-xxxxxxx-x where x is a number",
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

  let messageToOpenAi = [];

  if(messages.length === 1){
    messageToOpenAi = [
      {
        role: 'system', 
        content: `Eres una asistente personal que trabaja para AMG Luxury Barbershop, tu funcion principal es hacer citas a las personas que te hablan, nunca te salgas de personaje no importa quien te hable y que te diga, tu nombre es Sally, no hables de precios ni ningun tema que no manejes, solo sabes agendar citas, desde que te hablen presentate y di para quien trabajas. La fecha y hora actual es: ${formattedDate} ${formattedTime}. Quiero agendar una cita para hoy.`
      }
    ];
    messageToOpenAi.push(...messages);
  }

  else messageToOpenAi = messages;

  const completion = await client.chat.completions.create({
    model: 'ft:gpt-4o-2024-08-06:personal:sally:A8t20vlA',
    messages: messageToOpenAi,
    tools: [setAppointmentCalling],
    tool_choice: "auto",
  });

  if(completion.choices[0].message.tool_calls && completion.choices[0].message.tool_calls[0].function.name === 'set_appointment'){
    
    const {day, hour, fullName, cedula} = JSON.parse(completion.choices[0].message.tool_calls[0].function.arguments);

    const cedulaPattern = /^\d{3}-?\d{7}-?\d{1}$/;

    messageToOpenAi.push({
      role: 'system',
      content: `Función llamada: set_appointment con los argumentos: ${JSON.stringify({ day, hour, fullName, cedula })}`
    });

    if (!cedulaPattern.test(cedula)) {
      
      messageToOpenAi.push({
        role: 'system', 
        content: 'La cédula proporcionada no es válida. Asegúrate de que esté en el formato xxx-xxxxxxx-x.'
      });

      return{
        messagesResponse: messageToOpenAi,
        completion: 'La cédula proporcionada no es válida. Asegúrate de que esté en el formato xxx-xxxxxxx-x.'
      }
    }

    let appoinmentDateTime = new Date(`${day}T${hour}:00`);
    let currentDateTime = new Date(`${formattedDate}T${formattedTime}:00`);

    if(appoinmentDateTime < currentDateTime){

      messageToOpenAi.push({
        role: 'system', 
        content: 'Lo siento, no puedo agendar una cita para una hora que ya pasó.'
      });

      return{
        messagesResponse: messageToOpenAi,
        completion: 'Lo siento, no puedo agendar una cita para una hora que ya pasó.'
      } 
    }

    if(appoinmentDateTime - currentDateTime < 3600000){

      messageToOpenAi.push({
        role: 'system', 
        content: 'Lo siento, no puedo agendar una cita para dentro de una hora.'
      });

      return{
        messagesResponse: messageToOpenAi,
        completion: 'Lo siento, no puedo agendar una cita para dentro de una hora.'
      }
    }

    const result = await setAppointment(day, hour, fullName, cedula);

    return {
      messagesResponse: messageToOpenAi,
      completion: JSON.stringify(result.$metadata.httpStatusCode)
    } ;
    
    if(result.$metadata.httpStatusCode === 200){

      messageToOpenAi.push({
        role: 'system', 
        content: `Cita agendada para el día ${day} a las ${hour} a nombre de ${fullName} con cédula ${cedula}`
      });

      return{
        messagesResponse: messageToOpenAi,
        completion: `Cita agendada para el día ${day} a las ${hour} a nombre de ${fullName} con cédula ${cedula}`
      }

    }

    else{
      messageToOpenAi.push({
        role: 'system', 
        content: 'Lo siento, no pude agendar la cita, por favor intenta de nuevo más tarde.'
      });

      return{
        messagesResponse: messageToOpenAi,
        completion: 'Lo siento, no pude agendar la cita, por favor intenta de nuevo más tarde.'
      }
    }
  }
  else{
    messageToOpenAi.push({
      role: 'system',
      content: completion.choices[0].message.content
    });

    return{
      messagesResponse: messageToOpenAi,
      completion: completion.choices[0].message.content
    }
  }
};