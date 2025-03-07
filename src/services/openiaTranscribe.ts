import "dotenv/config";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

/**
 * Baixa o arquivo de áudio de uma URL e salva localmente antes de transcrevê-lo.
 * @param audioUrl URL do arquivo de áudio
 * @returns Texto transcrito ou null em caso de erro
 */
export const processAudio = async (audioUrl: string): Promise<string | null> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("Erro: Chave da API não configurada!");
    return null;
  }

  // Define diretório temporário e caminho do arquivo
  const tempDir = path.join(__dirname, "temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
  
  const filePath = path.join(tempDir, "audio.oga");

  try {
    // 1. Baixar o arquivo de áudio
    const response = await axios({
      url: audioUrl,
      method: "GET",
      responseType: "stream",
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    await new Promise<void>((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // 2. Criar o FormData para a API Whisper
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));
    formData.append("model", "whisper-1");

    const responseTranscription = await axios.post<{ text: string }>(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const transcribedText = responseTranscription.data.text;

    // 3. Apagar o arquivo temporário
    fs.unlinkSync(filePath);

    return transcribedText;
  } catch (error: any) {
    console.error("Erro no processo de transcrição:", error.response?.data || error);
    return null;
  }
};

