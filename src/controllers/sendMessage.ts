import fetch, { Headers, Response as FetchResponse } from "node-fetch";
import dotenv from "dotenv";
import { responseRandomPhrases } from "../services/responseNotDeep";
import { incrementFreePhoto } from "../services/incrementPhoto";

dotenv.config();

// Configurações
const ZAPLY_AUTH_TOKEN = process.env.ZAPLY_AUTH_TOKEN;
const INSTANCE_ID = process.env.INSTANCE_ID;
const URL_RANDON = process.env.URL_RANDON?.split(",") || [];

// Função para extrair o código específico e o restante do texto
const extractCodeAndText = (text: string): { code: string | null; remainingText: string } => {
    const codeRegex = /\b[A-Z0-9]{10}\b/; // Captura um código de 10 caracteres alfanuméricos maiúsculos
    const matches = text.match(codeRegex);
    const code = matches ? matches[0] : null;
    const remainingText = code ? text.replace(code, "").trim() : text;
    return { code, remainingText };
};

// Função para escolher uma URL aleatória
const getRandomUrl = (): string | null => {
    if (URL_RANDON.length === 0) return null;
    return URL_RANDON[Math.floor(Math.random() * URL_RANDON.length)];
};

// Função para enviar resposta pelo Zaply
export const sendMessageResponse = async (
  deepseekResponse: string,
  number: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${ZAPLY_AUTH_TOKEN}`);
    headers.append("Content-Type", "application/json");

    // Extraindo o número corretamente (caso venha no formato WhatsApp com @)
    let numberPart = number.split("@")[0];

    // Verifica e extrai o código específico e o restante do texto
    const { code: extractedCode, remainingText } = extractCodeAndText(deepseekResponse);
    const selectedUrl = extractedCode ? getRandomUrl() : null;

    let raw;
    let endpoint;

    if (selectedUrl) {
      // Incrementa o valor de free_photo apenas se houver um código extraído
      const { newValue, error } = await incrementFreePhoto(number);
      if (error) {
        console.error("Erro ao incrementar free_photo:", error);
      }
      
      if (newValue > 3) {
        raw = JSON.stringify({
          message: await responseRandomPhrases(),
          number: numberPart,
        });
        endpoint = `https://api.zaply.dev/v1/instance/${INSTANCE_ID}/message/send`;
      } else {
        raw = JSON.stringify({
          number: numberPart,
          media_caption: remainingText || "Confira esta mídia!",
          media_name: "Previa.png",
          media_url: selectedUrl,
        });
        endpoint = `https://api.zaply.dev/v1/instance/${INSTANCE_ID}/message/send/media`;
      }
    } else {
      raw = JSON.stringify({
        message: deepseekResponse,
        number: numberPart,
      });
      endpoint = `https://api.zaply.dev/v1/instance/${INSTANCE_ID}/message/send`;
    }

    console.log("Enviando payload para Zaply:", raw);

    const requestOptions = {
      method: "POST" as const,
      headers,
      body: raw,
      redirect: "follow" as RequestRedirect,
    };

    const response: FetchResponse = await fetch(endpoint, requestOptions);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("Resposta da API Zaply:", result);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Erro ao enviar mensagem:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
};
