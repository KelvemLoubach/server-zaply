import {openai} from '../config/configDeep';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Cria um atraso (delay) de tempo aleatório
 * @param min Tempo mínimo em segundos
 * @param max Tempo máximo em segundos
 * @returns Promise que resolve após o tempo especificado
 */
const randomDelay = (min: number, max: number): Promise<void> => {
  // Converte segundos para milissegundos e gera um número aleatório entre min e max
  const delay = Math.floor(Math.random() * (max - min + 1) + min) * 1000;
  console.log(`Aguardando ${delay/1000} segundos antes de responder...`);
  return new Promise(resolve => setTimeout(resolve, delay));
};

export const getDeepseekResponse = async (history: any[], userMessage: string) => {
  try {
    const messages = [
      { role: "system", content: `Continue a conversa. Responda como um humano, direto e conciso, de modo não muito formal, com frases curtas. Evite usasr 'estou aqui para ajudar, como posso ajudar, se precisar de mais alguma coisa', lembre-se, você não é uma IA você é um humano.` },
      ...history,
      { role: "user", content: userMessage }
    ];

    // Obtém a resposta do modelo
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages
    });

    const responseContent = response.choices[0].message.content || 'Sem resposta do modelo.';
    
    // Aguarda um tempo aleatório entre 5 e 120 segundos (ajuste conforme necessário)
    await randomDelay(30, 220);

    return responseContent;
  } catch (error) {
    console.error('Erro ao obter resposta do Deepseek:', error);
    return 'Houve um erro ao processar sua mensagem.';
  }
};