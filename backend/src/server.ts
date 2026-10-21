import dotenv from 'dotenv';
// Carregar variáveis de ambiente antes de qualquer outro import
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import { connectDatabase } from './config/database';
import authRoutes from './routes/authRoutes';
import grupoRoutes from './routes/grupoRoutes';
import leituraRoutes from './routes/leituraRoutes';
import livroRoutes from './routes/livroRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de Healthcheck
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Sistema de Competição de Leitura - API em funcionamento!',
    timestamp: new Date().toISOString(),
  });
});

// Registro de Rotas
app.use('/api/auth', authRoutes);
app.use('/api/grupos', grupoRoutes);
app.use('/api/leituras', leituraRoutes);
app.use('/api/livros', livroRoutes);

// Tratamento de rotas não encontradas
app.use((_req: Request, res: Response) => {
  res.status(404).json({ mensagem: 'Rota não encontrada.' });
});

// Inicialização do servidor
export const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 [Server] Servidor rodando na porta ${PORT}`);
    console.log(`📖 [API] Competição de Leitura pronta em http://localhost:${PORT}`);
  });
};

// Executar se chamado diretamente
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
