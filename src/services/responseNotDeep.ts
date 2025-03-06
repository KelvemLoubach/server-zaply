import { openai } from '../config/configDeep';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Função que envia uma mensagem para o modelo Deepseek e retorna a resposta como string
 * @param message Mensagem a ser enviada para o modelo
 * @returns Promise com a resposta do modelo como string
 */
export const getSimpleDeepseekResponse = async (): Promise<string> => {
  try {
    // Configuração da mensagem para o modelo
    const messages = [
      { 
        role: "system", 
        content: "Você é a Amanda, informe que o usuário já pediu demais, fale para que ele compre o pacote."
      },
      { 
        role: "user", 
        content: "Crie uma mensagem informando que o usuário já pediu fotos demais, fale para que ele compre o pacote., fale informalmente, use emojis, e seja direta e educada e envolvente."
      }
    ];

    // Chamada à API do modelo
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 300
    });

    // Extrai e retorna o conteúdo da resposta
    const responseContent = response.choices[0].message.content || 'Sem resposta do modelo.';
    return responseContent;
    
  } catch (error) {
    console.error('Erro ao obter resposta do Deepseek:', error);
    return 'Você excedeu o limite de uso. Por favor, tente novamente mais tarde.';
  }
};
