import express, { Request, Response } from 'express';

const app = express();
const port = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Rota básica
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World com TypeScript!');
});

// Rota de exemplo com POST
app.post('/dados', (req: Request, res: Response) => {
  const dados = req.body;
  console.log('Dados recebidos:', dados);
  res.status(201).json({ mensagem: 'Dados recebidos com sucesso!', dados });
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});