import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {sendMessageResponse} from '../controllers/sendMessage'
import {ApiResponse,MessageRequest,ZaplyMessageRequest} from '../interfaces/typesInterfaces'
import dotenv from 'dotenv';

const env = dotenv.config();

export const receiveMessage = async (req: Request, res: Response) => {

    
    try {
        // Validação do corpo da requisição
        const message = req.body.data.body;
        const number = req.body.data.from;
        console.log(req.body)
        
        if (!message || !number) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                error: 'Obrigatório número e mensagem.'
            } as ApiResponse);
        }

        // Processar a mensagem recebida
        console.log('Mensagem recebida:', { message, number });

        // Chamar a função de resposta separada
        const response = await sendMessageResponse("Isso é um teste de resposta.", '5533999493748');

        // Retornar resposta adequada
        const statusCode = response.success ? StatusCodes.OK : StatusCodes.INTERNAL_SERVER_ERROR;
        res.status(statusCode).json(response);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: errorMessage
        } as ApiResponse);
    }
};