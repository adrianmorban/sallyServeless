import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openAICompletion = async (messages) => {
  let messageToOpenAi = [
    {
      role: 'system', 
      content: 'You are a helpful assistant who helps users schedule appointments.'
    }
  ];
  messageToOpenAi.push(...messages);
  const completion = await client.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: messageToOpenAi,
  });
  return completion.choices[0].message.content;
};