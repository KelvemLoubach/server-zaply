
import fetch, { Headers, Response as FetchResponse } from 'node-fetch';
import { ApiResponse, MessageRequest, ZaplyMessageRequest } from '../interfaces/typesInterfaces';
import {openai} from '../config/configDeep';
import dotenv from 'dotenv';

dotenv.config();

// Configurações
const ZAPLY_AUTH_TOKEN = process.env.ZAPLY_AUTH_TOKEN || 'your_token_here';
const INSTANCE_ID = process.env.INSTANCE_ID || 'your_instance_id_here';

// Função separada para enviar resposta
export const sendMessageResponse = async (deepseekResponde:string, number:string): Promise<ApiResponse> => {
    try {
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${ZAPLY_AUTH_TOKEN}`);
        headers.append("Content-Type", "application/json");



        const raw = JSON.stringify({ deepseekResponde, number });

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
        console.log(result)

        return {
            success: true,
            data: result
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
            success: false,
            error: errorMessage
        };
    }
};