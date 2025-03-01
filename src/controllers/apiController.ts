import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { saveMessage } from "../services/saveSupabase";
import { sendMessageResponse } from "../controllers/sendMessage";
import {
  ApiResponse,
  Conversation,
  MessageRequest,
  ZaplyMessageRequest,
} from "../interfaces/typesInterfaces";
import dotenv from "dotenv";

const env = dotenv.config();

export const receiveMessage = async (req: Request, res: Response) => {
  try {
    // Validação do corpo da requisição

    // Array de números permitidos
    const allowedNumbers: string[] = [
        "5528998844998@c.us",
        "13135550@c.us"
    ];

    const from: string = req.body.data.from;
    const message = req.body.data.body;
    const number = req.body.data.from;

    // Verifica se o número está na lista de permitidos
    if (!allowedNumbers.includes(from)) {
        return res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            error: "Número não autorizado"
        } as ApiResponse);
    }

    // Processar a mensagem recebida

    const dataFromWhats: Conversation = {
      number: number,
      contente: [{ role: "user", content: message }],
    };
    console.log(dataFromWhats);

    await saveMessage(
      dataFromWhats.number,
      dataFromWhats.contente[0].role,
      dataFromWhats.contente[0].content
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: errorMessage,
    } as ApiResponse);
  }
};
