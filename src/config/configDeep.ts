
import OpenAI from "openai";
import dotenv from "dotenv";

const env = dotenv.config();

export const openai = new OpenAI({
        baseURL: process.env.URL_DEEP,
        apiKey: process.env.API_KEY_DEEP
});