import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// Configuração específica para a API da OpenAI
export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
