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
exports.getDeepseekResponse = exports.randomDelay = void 0;
const configDeep_1 = require("../config/configDeep");
const dotenv_1 = __importDefault(require("dotenv"));
const trancribeTexttoAudio_1 = require("./trancribeTexttoAudio");
const sendMessageAudio_1 = require("../controllers/sendMessageAudio");
dotenv_1.default.config();
/**
 * Cria um atraso (delay) de tempo aleatório
 * @param min Tempo mínimo em segundos
 * @param max Tempo máximo em segundos
 * @returns Promise que resolve após o tempo especificado
 */
const randomDelay = (min, max) => {
    // Converte segundos para milissegundos e gera um número aleatório entre min e max
    const delay = Math.floor(Math.random() * (max - min + 1) + min) * 1000;
    console.log(`Aguardando ${delay / 1000} segundos antes de responder...`);
    return new Promise(resolve => setTimeout(resolve, delay));
};
exports.randomDelay = randomDelay;
const getDeepseekResponse = (history, userMessage, type, number) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limitedHistory = history.slice(-10);
        const messages = [
            {
                role: "system",
                content: process.env.PROMPT_DEEP
            },
            ...limitedHistory,
            {
                role: "system",
                content: "Prepare-se para responder à próxima mensagem com base no contexto da conversa."
            },
            { role: "user", content: userMessage }
        ];
        const response = yield configDeep_1.openai.chat.completions.create({
            model: 'deepseek-chat',
            messages,
            temperature: 0.7, // Adiciona variabilidade nas respostas
            max_tokens: 300 // Limita o tamanho da resposta
        });
        const responseContent = response.choices[0].message.content || 'Sem resposta do modelo.';
        // Aguarda um tempo aleatório entre 5 e 120 segundos (ajuste conforme necessário)
        yield (0, exports.randomDelay)(2, 4);
        if (type === "ptt") {
            const urlAudio = yield (0, trancribeTexttoAudio_1.textToSpeech)(responseContent);
            yield (0, sendMessageAudio_1.sendMediaMessage)(urlAudio, number);
        }
        return responseContent;
    }
    catch (error) {
        console.error('Erro ao obter resposta do Deepseek:', error);
        return 'Houve um erro ao processar sua mensagem.';
    }
});
exports.getDeepseekResponse = getDeepseekResponse;
