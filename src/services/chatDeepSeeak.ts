import {openai} from '../config/configDeep';
import dotenv from 'dotenv';

dotenv.config();

export const getDeepseekResponse = async (history: any[], userMessage: string) => {
  try {
    const messages = [
      { role: "system", content: "Responda como um humano, direto e conciso, de modo não muito formal, com frases curtas." }, // Sempre no início
      ...history, // Histórico das últimas mensagens
      { role: "user", content: userMessage } // Mensagem atual do usuário
    ];

    const response = await openai.chat.completions.create({
      model: 'deepseek-chat', // Ou outro modelo disponível no Deepseek/OpenAI
      messages
    });

    return response.choices[0].message.content || 'Sem resposta do modelo.';

  } catch (error) {
    console.error('Erro ao obter resposta do Deepseek:', error);
    return 'Houve um erro ao processar sua mensagem.';
  }
};
