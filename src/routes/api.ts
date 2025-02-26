import { Router } from 'express';
import {receiveMessage} from '../controllers/apiController';
import {validateWebhookToken} from '../middlewares/authWebhook'

const router = Router();

router.post("/receiveMessage",receiveMessage);

export default router;