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
        // Array de números permitidos
        const allowedNumbers = [
            "5528998844998@c.us",
            "13135550002@c.us",
            "5514998373060@c.us"
        ];
        const from = req.body.data.from;
        const message = req.body.data.body;
        const number = req.body.data.from;
        console.log(from);
        // Verifica se o número está na lista de permitidos
        if (from !== "5514998373060@c.us") {
            return res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({
                success: false,
                error: "Número não autorizado"
            });
        }
        // Processar a mensagem recebida
        const dataFromWhats = {
            number: number,
            contente: [{ role: "user", content: message }],
        };
        console.log(dataFromWhats);
        yield (0, saveSupabase_1.saveMessage)(dataFromWhats.number, dataFromWhats.contente[0].role, dataFromWhats.contente[0].content);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: errorMessage,
        });
    }
});
exports.receiveMessage = receiveMessage;
