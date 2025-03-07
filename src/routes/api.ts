import { Router } from 'express';
import {receiveMessage} from '../controllers/apiController';
import {validateWebhookToken} from '../middlewares/authWebhook'
import {healthCheck} from '../controllers/towakeup'
import { webhook } from '../controllers/webhook';

const router = Router();

router.post("/receiveMessage",receiveMessage);
router.get("/healthCheck",healthCheck);
router.post("/webhook",webhook);

export default router;