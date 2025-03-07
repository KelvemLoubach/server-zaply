import fetch, { Headers, Response as FetchResponse } from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

// Configurações
const ZAPLY_AUTH_TOKEN = process.env.ZAPLY_AUTH_TOKEN;
const INSTANCE_ID = process.env.INSTANCE_ID;

/**
 * Função para enviar uma mensagem com mídia para um número específico
 * @param mediaUrl URL da mídia a ser enviada
 * @param number Número do destinatário (com ou sem @c.us)
 * @param caption Legenda opcional para a mídia
 * @returns Objeto com status de sucesso e dados ou erro
 */
export const sendMediaMessage = async (
  mediaUrl: string,
  number: string,
  caption: string = "Confira esta mídia!"
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    // Validação de parâmetros
    if (!mediaUrl || !mediaUrl.trim()) {
      throw new Error("URL da mídia é obrigatória");
    }
    
    if (!number || !number.trim()) {
      throw new Error("Número do destinatário é obrigatório");
    }

    const headers = new Headers();
    headers.append("Authorization", `Bearer ${ZAPLY_AUTH_TOKEN}`);
    headers.append("Content-Type", "application/json");

    // Extraindo o número corretamente (caso venha no formato WhatsApp com @)
    let numberPart = number.includes("@") ? number.split("@")[0] : number;

    // Preparando o payload para envio
    const payload = JSON.stringify({
      number: numberPart,
      media_caption: caption,
      media_name: `media_${Date.now()}.jpg`, // Nome dinâmico baseado no timestamp
      media_url: mediaUrl,
    });

    const endpoint = `https://api.zaply.dev/v1/instance/${INSTANCE_ID}/message/send/media`;

    console.log(`Enviando mídia para ${number}:`, mediaUrl);

    const requestOptions = {
      method: "POST" as const,
      headers,
      body: payload,
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
    console.error("Erro ao enviar mídia:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
};
