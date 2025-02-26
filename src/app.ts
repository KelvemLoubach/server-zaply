import express, { Request, Response } from 'express';
import router from "./routes/api";

// Verificar se a porta está definida
const PORT = process.env.PORT || 3000; // Valor padrão se a PORT não estiver definida

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Roteamento
app.use(router);

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Rodando na porta: ${PORT}`);
  });