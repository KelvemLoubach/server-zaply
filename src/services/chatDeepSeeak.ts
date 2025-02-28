import {openai} from '../config/configDeep';
import dotenv from 'dotenv';

dotenv.config();

export const getDeepseekResponse = async (history: any[], userMessage: string) => {
  try {
    const messages = [...history, { role: 'user', content: userMessage }];

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Ou outro modelo disponível no Deepseek/OpenAI
      messages,
      temperature: 0.7,
    });

    return response.choices[0].message.content || 'Sem resposta do modelo.';
    
  } catch (error) {
    console.error('Erro ao obter resposta do Deepseek:', error);
    return 'Houve um erro ao processar sua mensagem.';
  }
};
