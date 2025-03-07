"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageResponse = void 0;
const node_fetch_1 = __importStar(require("node-fetch"));
const dotenv_1 = __importDefault(require("dotenv"));
const responseNotDeep_1 = require("../services/responseNotDeep");
const incrementPhoto_1 = require("../services/incrementPhoto");
dotenv_1.default.config();
// Configurações
const ZAPLY_AUTH_TOKEN = process.env.ZAPLY_AUTH_TOKEN;
const INSTANCE_ID = process.env.INSTANCE_ID;
const URL_RANDON = ((_a = process.env.URL_RANDON) === null || _a === void 0 ? void 0 : _a.split(",")) || [];
// Função para extrair o código específico e o restante do texto
const extractCodeAndText = (text) => {
    const codeRegex = /\b[A-Z0-9]{10}\b/; // Captura um código de 10 caracteres alfanuméricos maiúsculos
    const matches = text.match(codeRegex);
    const code = matches ? matches[0] : null;
    const remainingText = code ? text.replace(code, "").trim() : text;
    return { code, remainingText };
};
// Função para escolher uma URL aleatória
const getRandomUrl = () => {
    if (URL_RANDON.length === 0)
        return null;
    return URL_RANDON[Math.floor(Math.random() * URL_RANDON.length)];
};
// Função para enviar resposta pelo Zaply
const sendMessageResponse = (deepseekResponse, number) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const headers = new node_fetch_1.Headers();
        headers.append("Authorization", `Bearer ${ZAPLY_AUTH_TOKEN}`);
        headers.append("Content-Type", "application/json");
        // Extraindo o número corretamente (caso venha no formato WhatsApp com @)
        let numberPart = number.split("@")[0];
        // Verifica e extrai o código específico e o restante do texto
        const { code: extractedCode, remainingText } = extractCodeAndText(deepseekResponse);
        const selectedUrl = extractedCode ? getRandomUrl() : null;
        let raw;
        let endpoint;
        if (selectedUrl) {
            // Incrementa o valor de free_photo apenas se houver um código extraído
            const { newValue, error } = yield (0, incrementPhoto_1.incrementFreePhoto)(number);
            if (error) {
                console.error("Erro ao incrementar free_photo:", error);
            }
            if (newValue > 3) {
                raw = JSON.stringify({
                    message: yield (0, responseNotDeep_1.responseRandomPhrases)(),
                    number: numberPart,
                });
                endpoint = `https://api.zaply.dev/v1/instance/${INSTANCE_ID}/message/send`;
            }
            else {
                raw = JSON.stringify({
                    number: numberPart,
                    media_caption: remainingText || "Confira esta mídia!",
                    media_name: "Previa.png",
                    media_url: selectedUrl,
                });
                endpoint = `https://api.zaply.dev/v1/instance/${INSTANCE_ID}/message/send/media`;
            }
        }
        else {
            raw = JSON.stringify({
                message: deepseekResponse,
                number: numberPart,
            });
            endpoint = `https://api.zaply.dev/v1/instance/${INSTANCE_ID}/message/send`;
        }
        console.log("Enviando payload para Zaply:", raw);
        const requestOptions = {
            method: "POST",
            headers,
            body: raw,
            redirect: "follow",
        };
        const response = yield (0, node_fetch_1.default)(endpoint, requestOptions);
        if (!response.ok) {
            const errorText = yield response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }
        const result = yield response.json();
        console.log("Resposta da API Zaply:", result);
        return {
            success: true,
            data: result,
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        console.error("Erro ao enviar mensagem:", errorMessage);
        return {
            success: false,
            error: errorMessage,
        };
    }
});
exports.sendMessageResponse = sendMessageResponse;
