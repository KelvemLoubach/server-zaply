import "dotenv/config";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

/**
 * Baixa o arquivo de áudio de uma URL e salva localmente.
 * @param audioUrl URL do arquivo de áudio
 * @returns Caminho do arquivo salvo localmente
 */
export const downloadAudio = async (audioUrl: string): Promise<string | null> => {
  try {
    const response = await axios({
      url: audioUrl,
      method: "GET",
      responseType: "stream",
    });

    const filePath = path.join(__dirname, "audio.oga");
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(filePath));
      writer.on("error", reject);
    });
  } catch (error) {
    console.error("Erro ao baixar o áudio:", error);
    return null;
  }
};

/**
 * Transcreve um áudio usando a OpenAI Whisper API.
 * @param audioPath Caminho do arquivo de áudio salvo localmente
 * @returns Texto transcrito
 */
const transcribeAudio = async (audioPath: string): Promise<string | null> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("Erro: Chave da API não configurada!");
    return null;
  }

  if (!fs.existsSync(audioPath)) {
    console.error("Erro: Arquivo de áudio não encontrado!");
    return null;
  }

  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(audioPath));
    formData.append("model", "whisper-1");

    const response = await axios.post<{ text: string }>(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    return response.data.text;
  } catch (error: any) {
    console.error("Erro ao transcrever:", error.response?.data || error);
    return null;
  }
};

/**
 * Processo completo: baixa o áudio e transcreve.
 * @param audioUrl URL do arquivo de áudio
 */
const processAudio = async (audioUrl: string): Promise<void> => {
  const filePath = await downloadAudio(audioUrl);
  if (!filePath) return;

  const text = await transcribeAudio(filePath);
  if (text) console.log("Texto transcrito:", text);

  // Remove o arquivo temporário
  fs.unlinkSync(filePath);
};

