"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveMessage = void 0;
const configSupabase_1 = require("../config/configSupabase");
const chatDeepSeeak_1 = require("./chatDeepSeeak");
const sendMessage_1 = require("../controllers/sendMessage");
const saveMessage = (number, role, content, type) => __awaiter(void 0, void 0, void 0, function* () {
    // Passo 1: Verifica se o usuário já existe
    const { data: existingUser, error: userError } = yield configSupabase_1.supabase
        .from('users')
        .select('number') // Pegamos o número do usuário (chave primária)
        .eq('number', number)
        .single();
    if (userError && userError.code !== 'PGRST116') {
        console.error('Erro ao verificar usuário:', userError);
        return;
    }
    // Passo 2: Se o usuário não existir, cria um novo registro
    if (!existingUser) {
        const { error: insertUserError } = yield configSupabase_1.supabase
            .from('users')
            .insert([{ number }]);
        if (insertUserError) {
            console.error('Erro ao criar usuário:', insertUserError);
            return;
        }
    }
    // Passo 3: Verifica se já existe uma conversa para esse usuário
    const { data: existingMessage, error: messageError } = yield configSupabase_1.supabase
        .from('messages')
        .select('content')
        .eq('user_id', number) // Usamos o `number` como chave estrangeira
        .order('created_at', { ascending: false })
        .limit(10)
        .single();
    if (messageError && messageError.code !== 'PGRST116') {
        console.error('Erro ao buscar mensagens existentes:', messageError);
        return;
    }
    let updatedContent = [{ role, content }];
    // Se já houver mensagens anteriores, adicionamos ao array existente
    if (existingMessage && existingMessage.content) {
        updatedContent = [...existingMessage.content, { role: 'user', content }];
    }
    const responseDeep = yield (0, chatDeepSeeak_1.getDeepseekResponse)(updatedContent, content, type, number);
    updatedContent = [...updatedContent, { role: 'assistant', content: responseDeep }];
    // Envia a resposta para o usuário
    if (type !== "ptt") {
        yield (0, sendMessage_1.sendMessageResponse)(responseDeep, number);
    }
    console.log("Conversation History (JSON):", JSON.stringify(updatedContent, null, 2));
    // Passo 4: Insere ou atualiza a conversa na tabela `messages`
    if (existingMessage) {
        // Atualiza a mensagem existente adicionando o novo conteúdo ao JSONB
        const { error: updateMessageError } = yield configSupabase_1.supabase
            .from('messages')
            .update({ content: updatedContent })
            .eq('user_id', number);
        if (updateMessageError) {
            console.error('Erro ao atualizar mensagens:', updateMessageError);
        }
        else {
            console.log('Mensagem adicionada com sucesso!');
        }
    }
    else {
        // Insere uma nova conversa com a primeira mensagem
        const { error: insertMessageError } = yield configSupabase_1.supabase
            .from('messages')
            .insert([{ user_id: number, content: updatedContent }]);
        if (insertMessageError) {
            console.error('Erro ao salvar nova mensagem:', insertMessageError);
        }
        else {
            console.log('Nova conversa iniciada e mensagem salva!');
        }
    }
});
exports.saveMessage = saveMessage;
