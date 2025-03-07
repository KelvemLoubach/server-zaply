import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import path from "path";
import { supabase } from "../config/configSupabase";

dotenv.config();
/**
 * Converte texto em áudio usando a OpenAI API, salva no Supabase e retorna a URL.
 * @param text Texto a ser convertido em áudio
 * @param voice Voz desejada (default: "alloy")
 * @returns URL do áudio armazenado no Supabase ou null em caso de erro
 */
export const textToSpeech = async (text: string, voice: string = "alloy"): Promise<string | null> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("Erro: Chave da API não configurada!");
    return null;
  }

  // Diretório temporário para armazenar o arquivo localmente antes do upload
  const tempDir = path.join(__dirname, "temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  const fileName = `audio_${Date.now()}.mp3`; // Nome único para evitar sobrescrita
  const filePath = path.join(tempDir, fileName);

  try {
    console.log("Iniciando a conversão de texto para áudio...");
    console.log("Texto a ser convertido:", text);
    console.log("Voz selecionada:", voice);

    // 1️⃣ Chamada à API OpenAI para conversão de texto em fala
    const response = await axios({
      method: "post",
      url: "https://api.openai.com/v1/audio/speech",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      data: {
        model: "tts-1",
        input: text,
        voice: voice,
      },
      responseType: "arraybuffer", // O áudio vem em binário
    });

    console.log("Resposta da API OpenAI recebida, tamanho do áudio:", response.data.byteLength);

    // 2️⃣ Salvar o áudio temporariamente no servidor
    fs.writeFileSync(filePath, Buffer.from(response.data));
    console.log("Áudio salvo temporariamente em:", filePath);

    // 3️⃣ Upload para o Supabase Storage
    const { data, error } = await supabase.storage
      .from("audioresponse")
      .upload(fileName, fs.createReadStream(filePath), { contentType: "audio/mpeg" });

    if (error) {
      console.error("Erro no upload do áudio:", error.message);
      return null;
    }

    console.log("Upload do áudio concluído, dados retornados:", data);

    // 4️⃣ Obter URL pública do áudio no Supabase
    const { data: publicUrl } = supabase.storage
      .from("audioresponse")
      .getPublicUrl(data.path);

    console.log("URL pública do áudio obtida:", publicUrl.publicUrl);

    // 5️⃣ Salvar a URL no banco de dados (tabela urlAudio)
    const { error: dbError } = await supabase
      .from("urlAudio")
      .insert([{ url: publicUrl.publicUrl, created_at: new Date() }]);

    if (dbError) {
      console.error("Erro ao salvar URL no banco:", dbError.message);
      return null;
    }

    console.log("Áudio salvo no Supabase:", publicUrl.publicUrl);

    // 6️⃣ Remover arquivo temporário local
    fs.unlinkSync(filePath);
    console.log("Arquivo temporário removido:", filePath);

    return publicUrl.publicUrl;
  } catch (error: any) {
    console.error("Erro na conversão de texto para áudio:", error.response?.data || error);
    return null;
  }
};


