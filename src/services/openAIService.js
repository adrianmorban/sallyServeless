import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openAICompletion = async (message) => {
  const completion = await client.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{role: 'system', content: 'You are a helpful assistant who helps users schedule appointments.'}, {role: 'user', content: message}],
  });
  return completion.choices[0].message.content;
};