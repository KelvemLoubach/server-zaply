import fetch, { Headers, Response as FetchResponse } from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// Configurações
const ZAPLY_AUTH_TOKEN = process.env.ZAPLY_AUTH_TOKEN;
const INSTANCE_ID = process.env.INSTANCE_ID ;

// Função para enviar resposta pelo Zaply
export const sendMessageResponse = async (deepseekResponse: string, number: string): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${ZAPLY_AUTH_TOKEN}`);
        headers.append("Content-Type", "application/json");

        // Extraindo o número corretamente (caso venha no formato WhatsApp com @)
        let numberPart = number.split('@')[0];

        // // Formata o número para garantir que está correto (adicione código do país se necessário)
        // if (!numberPart.startsWith('+')) {
        //     numberPart = `+${numberPart}`;
        // }

        // Corpo da requisição conforme a documentação
        const raw = JSON.stringify({
            message: deepseekResponse,
            number: numberPart
        });

        console.log("Enviando payload para Zaply:", raw);

        const requestOptions = {
            method: 'POST' as const,
            headers,
            body: raw,
            redirect: 'follow' as RequestRedirect
        };

        const response: FetchResponse = await fetch(
            `https://api.zaply.dev/v1/instance/${INSTANCE_ID}/message/send`,
            requestOptions
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log("Resposta da API Zaply:", result);

        return {
            success: true,
            data: result
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error("Erro ao enviar mensagem:", errorMessage);
        return {
            success: false,
            error: errorMessage
        };
    }
};
