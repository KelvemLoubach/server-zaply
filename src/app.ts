import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import router from "./routes/api";
import { textToSpeech } from './services/trancribeTexttoAudio';

// Verificar se a porta está definida
const PORT = process.env.PORT || 5000; // Valor padrão se a PORT não estiver definida

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Roteamento
app.use(router);


app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
      status: 'error',
      message: 'Endpoint não encontrado'
  });
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Rodando na porta: ${PORT}`);
  });

  try {
     textToSpeech();
    console.log('Função textToSpeech executada com sucesso.');
  } catch (error) {
    console.error('Erro ao executar textToSpeech:', error);
  }