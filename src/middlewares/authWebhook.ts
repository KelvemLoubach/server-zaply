// middlewares/webhookAuth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import dotenv from 'dotenv';

const env = dotenv.config();

const WEBHOOK_AUTH_TOKEN = process.env.WEBHOOK_AUTH_TOKEN;

export const validateWebhookToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Verificar se o token está presente no body
 
  const auth_token = req.body.custom_params?.auth_token;

  if (!auth_token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      error: 'Token de autenticação não fornecido'
    });
  }

  if (auth_token !== WEBHOOK_AUTH_TOKEN) {
    return res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      error: 'Token de autenticação inválido'
    });
  }

  // Remove o token do body após validação
  delete req.body.custom_params.auth_token;
  
  next();
};