import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { saveMessage } from "../services/saveSupabase";
import { processAudio } from "../services/openiaTranscribe";
import {
  ApiResponse,
  Conversation,
} from "../interfaces/typesInterfaces";
import dotenv from "dotenv";

const env = dotenv.config();

export const receiveMessage = async (req: Request, res: Response) => {
  try {
    // Validação do corpo da requisição

    // Array de números permitidos
    const allowedNumbers: string[] = [
        "5528998844998@c.us",
        "13135550002@c.us",
        "5514998373060@c.us"
    ];

    const from: string = req.body.data.from;
    const message = req.body.data.body;
    const number = req.body.data.from;
    let type = req.body.data.type;

    let audioTranscription: string | null = null;
    
    
    // Verifica se o número está na lista de permitidos
    if (from !== "5514998373060@c.us") {
        return res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            error: "Número não autorizado"
        } as ApiResponse);
    }

    if(req.body.data.mimetype === "audio/ogg; codecs=opus"){
      audioTranscription = await processAudio(req.body.data.url);
      
      if(audioTranscription === null){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: "Erro ao processar o áudio"
        } as ApiResponse);
      }
    }
        
    const messageContent = message || audioTranscription || "";

    const dataFromWhats: Conversation = {
      number: number,
      contente: [{ role: "user", content: messageContent }],
      type: type
    };
    console.log(dataFromWhats);

    await saveMessage(
      dataFromWhats.number,
      dataFromWhats.contente[0].role,
      dataFromWhats.contente[0].content,
      dataFromWhats.type
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
