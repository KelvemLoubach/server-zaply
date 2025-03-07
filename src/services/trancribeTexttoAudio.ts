import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { supabase } from "../config/configSupabase";
import { openaiClient } from "../config/configOpenai";

dotenv.config();

export const textToSpeech = async (): Promise<any> => {
  try {
    const speechFilePath = path.resolve("./speech.mp3");

    // Gerar o áudio com OpenAI
    const mp3 = await openaiClient.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: "Olá, como posso ajudar você hoje? Isso é um teste de áudio.",
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(speechFilePath, buffer);

    console.log("Áudio gerado:", speechFilePath);

    // Upload para Supabase Storage
    const fileBuffer = fs.readFileSync(speechFilePath);
    const fileName = `audios/${Date.now()}.mp3`; // Nome único

    const { data, error } = await supabase.storage
      .from("audioresponse") // Nome do bucket
      .upload(fileName, fileBuffer, {
        contentType: "audio/mpeg",
      });

    if (error) throw error;

    console.log("Upload bem-sucedido:", data.path);

    // Obter a URL pública do áudio
    const { data: publicUrlData } = supabase.storage.from("audios").getPublicUrl(fileName);
    console.log("URL pública do áudio:", publicUrlData.publicUrl);

    return publicUrlData.publicUrl;
  } catch (error: any) {
    console.error("Erro na conversão e upload do áudio:", error);
    return null;
  }
};