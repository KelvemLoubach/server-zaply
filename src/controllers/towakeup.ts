import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const healthCheck = (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({
        status: 'running',
        timestamp: new Date().toISOString()
    });
};