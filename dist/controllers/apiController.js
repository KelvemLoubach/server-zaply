"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiveMessage = void 0;
const http_status_codes_1 = require("http-status-codes");
const saveSupabase_1 = require("../services/saveSupabase");
const dotenv_1 = __importDefault(require("dotenv"));
const env = dotenv_1.default.config();
const receiveMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validação do corpo da requisição
        const filterTeste = '13135550002@c.us';
        const from = req.body.data.from;
        const message = req.body.data.body;
        const number = req.body.data.from;
        if (from !== filterTeste) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                error: 'Não é permitido esse número.'
            });
        }
        // Processar a mensagem recebida
        const dataFromWhats = {
            number: number,
            contente: [{ role: 'user', content: message }]
        };
        yield (0, saveSupabase_1.saveMessage)(dataFromWhats.number, dataFromWhats.contente[0].role, dataFromWhats.contente[0].content);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: errorMessage
        });
    }
});
exports.receiveMessage = receiveMessage;
