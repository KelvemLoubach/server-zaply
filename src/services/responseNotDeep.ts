import { supabase } from '../config/configSupabase';
import { openai } from '../config/configDeep';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Função que busca as 10 últimas mensagens de um usuário específico no Supabase
 * e gera uma resposta informando que o usuário já pediu muitas fotos
 * @param number Número do usuário para buscar as mensagens
 * @returns Promise com a resposta do modelo como string
 */
export const getDeepseekResponseWithHistory = async (number: string): Promise<string> => {
  try {
    // Consulta ao Supabase para obter as 10 últimas mensagens do usuário
    const { data, error } = await supabase
      .from('messages')
      .select('content')
      .eq('user_id', number)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Erro ao buscar mensagens:', error);
      return 'Erro ao buscar histórico de mensagens.';
    }

    // Prepara o histórico de mensagens para o modelo
    const messages = [
      { 
        role: "system", 
        content: "Você é a Amanda, informe que o usuário já pediu demais, fale para que ele compre o pacote. "
      },
      //...data.map((msg: any) => ({ role: msg.role, content: msg.content })),
      { 
        role: "user", 
        content: "Crie uma mensagem informando que já enviei muitas fotos, e que ele pode comprar o pacote para ver mais. Ex.: Mb, já enviei 3 fotos, compre o pacote para ver mais. , bb, já mandei muitas rsrs. Responda nesse tom e nesse contexto."
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
