import {openai} from '../config/configDeep';
import dotenv from 'dotenv';
import { textToSpeech } from './trancribeTexttoAudio';
import { sendMediaMessage } from '../controllers/sendMessageAudio';
dotenv.config();

/**
 * Cria um atraso (delay) de tempo aleatório
 * @param min Tempo mínimo em segundos
 * @param max Tempo máximo em segundos
 * @returns Promise que resolve após o tempo especificado
 */
export const randomDelay = (min: number, max: number): Promise<void> => {
  // Converte segundos para milissegundos e gera um número aleatório entre min e max
  const delay = Math.floor(Math.random() * (max - min + 1) + min) * 1000;
  console.log(`Aguardando ${delay/1000} segundos antes de responder...`);
  return new Promise(resolve => setTimeout(resolve, delay));
};

let contentPromppt: string | null = null;

export const getDeepseekResponse = async (history: any[], userMessage: string, type: string, number: string) => {
  try {
    const limitedHistory = history.slice(-10);

    contentPromppt = process.env.PROMPT_DEEP as string;
    
    if(type === "ptt"){
      contentPromppt = process.env.PROMPT_DEEP_AUDIO as string;
    }

    const messages = [
      { 
        role: "system", 
        content: contentPromppt
      },
      ...limitedHistory,
      { 
        role: "system", 
        content: "Prepare-se para responder à próxima mensagem com base no contexto da conversa." 
      },
      { role: "user", content: userMessage }
    ];

    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages,
      temperature: 0.7, // Adiciona variabilidade nas respostas
      max_tokens: 300   // Limita o tamanho da resposta
    });

    const responseContent = response.choices[0].message.content || 'Sem resposta do modelo.';
    
    // Aguarda um tempo aleatório entre 5 e 120 segundos (ajuste conforme necessário)
    await randomDelay(2, 4);

    if(type === "ptt"){
       const urlAudio = await textToSpeech(responseContent) as string;
        await sendMediaMessage(urlAudio, number);
     }

    return responseContent;
    
  } catch (error) {
    console.error('Erro ao obter resposta do Deepseek:', error);
    return 'Houve um erro ao processar sua mensagem.';
  }
};