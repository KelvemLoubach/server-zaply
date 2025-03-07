import { Request, Response } from 'express';

export const webhook = async (req: Request, res: Response) => {
  const { message } = req.body;
  console.log(message);
};

