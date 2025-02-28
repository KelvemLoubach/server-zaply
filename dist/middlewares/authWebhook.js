"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateWebhookToken = void 0;
const http_status_codes_1 = require("http-status-codes");
const dotenv_1 = __importDefault(require("dotenv"));
const env = dotenv_1.default.config();
const WEBHOOK_AUTH_TOKEN = process.env.WEBHOOK_AUTH_TOKEN;
const validateWebhookToken = (req, res, next) => {
    // Verificar se o token está presente no body
    var _a;
    const auth_token = (_a = req.body.custom_params) === null || _a === void 0 ? void 0 : _a.auth_token;
    if (!auth_token) {
        return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
            success: false,
            error: 'Token de autenticação não fornecido'
        });
    }
    if (auth_token !== WEBHOOK_AUTH_TOKEN) {
        return res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({
            success: false,
            error: 'Token de autenticação inválido'
        });
    }
    // Remove o token do body após validação
    delete req.body.custom_params.auth_token;
    next();
};
exports.validateWebhookToken = validateWebhookToken;
