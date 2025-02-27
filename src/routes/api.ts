import { Router } from 'express';
import {receiveMessage} from '../controllers/apiController';
import {validateWebhookToken} from '../middlewares/authWebhook'
import {healthCheck} from '../controllers/towakeup'

const router = Router();

router.post("/receiveMessage",validateWebhookToken,receiveMessage);
router.get("/healthCheck",healthCheck);

export default router;