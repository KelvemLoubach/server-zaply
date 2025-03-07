"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_status_codes_1 = require("http-status-codes");
const api_1 = __importDefault(require("./routes/api"));
const trancribeTexttoAudio_1 = require("./services/trancribeTexttoAudio");
// Verificar se a porta está definida
const PORT = process.env.PORT || 5000; // Valor padrão se a PORT não estiver definida
const app = (0, express_1.default)();
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
// Roteamento
app.use(api_1.default);
app.use((req, res) => {
    res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
        status: 'error',
        message: 'Endpoint não encontrado'
    });
});
// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Rodando na porta: ${PORT}`);
});
try {
    (0, trancribeTexttoAudio_1.textToSpeech)();
    console.log('Função textToSpeech executada com sucesso.');
}
catch (error) {
    console.error('Erro ao executar textToSpeech:', error);
}
