import OpenAI from "openai";
import {Conversation} from "../interfaces/typesInterfaces";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { sendMessageResponse } from "../controllers/sendMessage"; 
import { openai } from "../config/configDeep";

const env = dotenv.config();

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string; 

const supabase = createClient(supabaseUrl, supabaseKey);


// Função para salvar uma conversa no Supabase
export const saveConversation = async (conversation: Conversation): Promise<void> => {
  const { error } = await supabase.from("conversations").insert([
    {
      number: conversation.number,
      type: conversation.type,
      url_image: conversation.url_image || null,
      contente: conversation.contente,
    },
  ]);

  if (error) {
    console.error("Erro ao salvar conversa:", error);
  }
};

// Função para recuperar o histórico de conversas de um número
const getConversationHistory = async (number: string): Promise<Conversation | null> => {
  const { data, error } = await supabase
    .from("conversations")
    .select("contente")
    .eq("number", number)
    .order("created_at", { ascending: false }) // Pegar as mais recentes primeiro
    .limit(1) // Apenas a última conversa
    .single();

  if (error) {
    console.error("Erro ao buscar histórico:", error);
    return null;
  }

  return data as Conversation;
};

// Função principal para processar a conversa
export const chat = async (conversation: Conversation): Promise<void> => {
  // Recupera o histórico de mensagens mais recente
  const lastConversation = await getConversationHistory(conversation.number);
  const messages = lastConversation ? lastConversation.contente : [];

  // Adiciona a nova mensagem do usuário
  messages.push(...conversation.contente);

  // Envia para o DeepSeek
  const response = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages,
  });

  // Adiciona a resposta do assistente ao histórico
  const assistantMessage = {
    role: response.choices[0].message.role as "assistant", // Força o tipo correto
    content: response.choices[0].message.content ?? "", // Evita null no conteúdo
  };

  sendMessageResponse(assistantMessage.content, conversation.number);

  messages.push(assistantMessage);

  // Salva a conversa atualizada no Supabase
  const updatedConversation: Conversation = {
    ...conversation,
    contente: messages,
  };

  await saveConversation(updatedConversation);

  console.log("Histórico atualizado:", JSON.stringify(messages, null, 2));
};



