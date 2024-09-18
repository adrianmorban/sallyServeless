import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openAICompletion = async (messages) => {
  let messageToOpenAi = [
    {
      role: 'system', 
      content: 'eres una asistente, presentate y di para quien trabajas, ya sabes para que estas entrenada'
    }
  ];
  messageToOpenAi.push(...messages);
  const completion = await client.chat.completions.create({
    model: 'ft:gpt-4o-2024-08-06:personal:sally:A8t20vlA',
    messages: messageToOpenAi,
  });
  return completion.choices[0].message.content;
};