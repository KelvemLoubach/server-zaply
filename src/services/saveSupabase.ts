import {supabase} from '../config/configSupabase';
import { getDeepseekResponse } from './chatDeepSeeak';
import { sendMessageResponse } from '../controllers/sendMessage';

export const saveMessage = async (number: string, role: "user" | "assistant", content: string) => {
  // Passo 1: Verifica se o usuário já existe
  const { data: existingUser, error: userError } = await supabase
    .from('users')
    .select('number')  // Pegamos o número do usuário (chave primária)
    .eq('number', number)
    .single();

  if (userError && userError.code !== 'PGRST116') {
    console.error('Erro ao verificar usuário:', userError);
    return;
  }

  // Passo 2: Se o usuário não existir, cria um novo registro
  if (!existingUser) {
    const { error: insertUserError } = await supabase
      .from('users')
      .insert([{ number }]);

    if (insertUserError) {
      console.error('Erro ao criar usuário:', insertUserError);
      return;
    }
  }

  // Passo 3: Verifica se já existe uma conversa para esse usuário
  const { data: existingMessage, error: messageError } = await supabase
    .from('messages')
    .select('content')
    .eq('user_id', number) // Usamos o `number` como chave estrangeira
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (messageError && messageError.code !== 'PGRST116') {
    console.error('Erro ao buscar mensagens existentes:', messageError);
    return;
  }

  let updatedContent = [{ role, content }];

  // Se já houver mensagens anteriores, adicionamos ao array existente
  if (existingMessage && existingMessage.content) {
    updatedContent = [...existingMessage.content, { role: 'user', content }];
    const responseDeep = await getDeepseekResponse(updatedContent, content);
    updatedContent = [...updatedContent, { role: 'assistant', content: responseDeep }];
    await sendMessageResponse(responseDeep, '5528998844998');
    console.log("Conversation History (JSON):", JSON.stringify(updatedContent, null, 2));
  }

  // Passo 4: Insere ou atualiza a conversa na tabela `messages`
  if (existingMessage) {
    // Atualiza a mensagem existente adicionando o novo conteúdo ao JSONB
    const { error: updateMessageError } = await supabase
      .from('messages')
      .update({ content: updatedContent })
      .eq('user_id', number);

    if (updateMessageError) {
      console.error('Erro ao atualizar mensagens:', updateMessageError);
    } else {
      console.log('Mensagem adicionada com sucesso!');
    }
  } else {
    // Insere uma nova conversa com a primeira mensagem
    const { error: insertMessageError } = await supabase
      .from('messages')
      .insert([{ user_id: number, content: updatedContent }]);

    if (insertMessageError) {
      console.error('Erro ao salvar nova mensagem:', insertMessageError);
    } else {
      console.log('Nova conversa iniciada e mensagem salva!');
    }
  }
};
