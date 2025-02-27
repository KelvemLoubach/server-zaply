import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {sendMessageResponse} from '../controllers/sendMessage'
import {chat} from '../services/chatDeepSeeak';
import {ApiResponse,Conversation,MessageRequest,ZaplyMessageRequest} from '../interfaces/typesInterfaces'
import dotenv from 'dotenv';

const env = dotenv.config();

export const receiveMessage = async (req: Request, res: Response) => {

    
    try {
        // Validação do corpo da requisição

        const filterTeste: string = '13135550002@c.us'; 
        const from:string = req.body.data.from;
    
        const message = req.body.data.body;
        const number = req.body.data.from;
        console.log(req.body.data)
        
        if (from !== filterTeste) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                error: 'Não é permitido esse número.'
            } as ApiResponse);
        }

        // Processar a mensagem recebida
        console.log('Mensagem recebida:', { message, number });

        const dataFromWhats:Conversation = {
            number: number,
            type: 'whatsapp',
            url_image: '',
            contente: [{ role: 'user', content: message }]  
        }

        await chat(dataFromWhats)

      

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: errorMessage
        } as ApiResponse);
    }
};
