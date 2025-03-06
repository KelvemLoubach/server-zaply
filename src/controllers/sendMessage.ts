import fetch, { Headers, Response as FetchResponse } from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

// Configurações
const ZAPLY_AUTH_TOKEN = process.env.ZAPLY_AUTH_TOKEN;
const INSTANCE_ID = process.env.INSTANCE_ID;

// Função para extrair a URL específica e o restante do texto
const extractUrlAndText = (text: string): { url: string | null; remainingText: string } => {
    const specificUrlRegex = /https:\/\/dsqzklhtbknituailkrf[^\s]*/;
    const matches = text.match(specificUrlRegex);
    const url = matches ? matches[0] : null;
    const remainingText = url ? text.replace(url, "").trim() : text;
    return { url, remainingText };
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

    // Verifica e extrai a URL específica e o restante do texto
    const { url: extractedUrl, remainingText } = extractUrlAndText(deepseekResponse);

    let raw;
    let endpoint;
    if (extractedUrl) {
      // Se houver URL, monta payload para mídia
      raw = JSON.stringify({
        number: numberPart,
        media_caption: remainingText || "Só essa rsrs",
        media_name: "Previa.png",
        media_url: extractedUrl,
      });
      endpoint = `https://api.zaply.dev/v1/instance/${INSTANCE_ID}/message/send/media`;
    } else {
      // Se não houver URL, monta payload para mensagem de texto
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
