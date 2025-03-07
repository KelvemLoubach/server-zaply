import { supabase } from '../config/configSupabase';
import { openai } from '../config/configDeep';
import dotenv from 'dotenv';
import { randomDelay } from './chatDeepSeeak';

dotenv.config();

/**
 * Função que busca as 10 últimas mensagens de um usuário específico no Supabase
 * e gera uma resposta informando que o usuário já pediu muitas fotos
 * @param number Número do usuário para buscar as mensagens
 * @returns Promise com a resposta do modelo como string
 */
export const responseRandomPhrases = async (): Promise<string> => {
  try {
   

    function getRandomResponse(): string {
      // Obtém a string de frases do ambiente
      const responses = process.env.PROMPT_DEEP_NOT_DEEP || '';
      
      // Divide a string em um array de frases
      const phrases = responses.split(' - ');
  
      // Gera um índice aleatório
      const randomIndex = Math.floor(Math.random() * phrases.length);
  
      // Retorna a frase aleatória
      return phrases[randomIndex].trim(); // trim() para remover espaços em branco extras
  }

    // Extrai eretorna o conteúdo da resposta
    const responseContent = getRandomResponse();
   

    await randomDelay(2, 4);
    
    return responseContent;
    
  } catch (error) {
    console.error('Erro ao obter resposta do Deepseek:', error);
    return 'Você excedeu o limite de uso. Por favor, tente novamente mais tarde.';
  }
};
