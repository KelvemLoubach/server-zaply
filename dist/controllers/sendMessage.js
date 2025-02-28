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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageResponse = void 0;
const node_fetch_1 = __importStar(require("node-fetch"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Configurações
const ZAPLY_AUTH_TOKEN = process.env.ZAPLY_AUTH_TOKEN || 'your_token_here';
const INSTANCE_ID = process.env.INSTANCE_ID || 'your_instance_id_here';
// Função para enviar resposta pelo Zaply
const sendMessageResponse = (deepseekResponse, number) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const headers = new node_fetch_1.Headers();
        headers.append("Authorization", `Bearer ${ZAPLY_AUTH_TOKEN}`);
        headers.append("Content-Type", "application/json");
        // Extraindo o número corretamente (caso venha no formato WhatsApp com @)
        let numberPart = number.split('@')[0];
        // Formata o número para garantir que está correto (adicione código do país se necessário)
        if (!numberPart.startsWith('+')) {
            numberPart = `+${numberPart}`;
        }
        // Corpo da requisição conforme a documentação
        const raw = JSON.stringify({
            message: deepseekResponse,
            number: numberPart
        });
        console.log("Enviando payload para Zaply:", raw);
        const requestOptions = {
            method: 'POST',
            headers,
            body: raw,
            redirect: 'follow'
        };
        const response = yield (0, node_fetch_1.default)(`https://api.zaply.dev/v1/instance/${INSTANCE_ID}/message/send`, requestOptions);
        if (!response.ok) {
            const errorText = yield response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }
        const result = yield response.json();
        console.log("Resposta da API Zaply:", result);
        return {
            success: true,
            data: result
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error("Erro ao enviar mensagem:", errorMessage);
        return {
            success: false,
            error: errorMessage
        };
    }
});
exports.sendMessageResponse = sendMessageResponse;
