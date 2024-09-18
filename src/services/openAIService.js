import OpenAI from 'openai';

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
  });
  return completion.choices[0].message.content;
};