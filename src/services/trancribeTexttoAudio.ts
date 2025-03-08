import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { supabase } from "../config/configSupabase";
import { openaiClient } from "../config/configOpenai";

dotenv.config();

export const textToSpeech = async (responseContent: string): Promise<string | null> => {
  try {
    const speechFilePath = path.resolve("./speech.mp3");

    console.log(responseContent + " texto para gerar o audio");// Gerar o áudio com OpenAI
    const mp3 = await openaiClient.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: responseContent,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(speechFilePath, buffer);

    console.log("Áudio gerado:", speechFilePath);

    // Upload para Supabase Storage
    const fileBuffer = fs.readFileSync(speechFilePath);
    const fileName = `${Date.now()}.mp3`; // Nome único

    const { data, error } = await supabase.storage
      .from("audioresponse") // Nome do bucket
      .upload(`audios/${fileName}`, fileBuffer, {
        contentType: "audio/mpeg",
      });

    if (error) throw error;

    console.log("Upload bem-sucedido:", data.path);

    // Obter URL pública do áudio no Supabase
    const { data: publicUrlData } = supabase.storage
      .from("audioresponse") // Certifique-se de que o bucket está correto
      .getPublicUrl(`audios/${fileName}`); // Adicione o caminho correto para a pasta

    console.log("URL pública do áudio obtida:", publicUrlData.publicUrl);

    return publicUrlData.publicUrl;
  } catch (error: any) {
    console.error("Erro na conversão e upload do áudio:", error);
    return null;
  }
};