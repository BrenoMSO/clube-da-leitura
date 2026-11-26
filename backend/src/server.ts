import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import { connectDatabase } from './config/database';
import authRoutes from './routes/authRoutes';
import grupoRoutes from './routes/grupoRoutes';
import leituraRoutes from './routes/leituraRoutes';
import livroRoutes from './routes/livroRoutes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';


const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'https://brenomso.github.io',
  'https://clube-da-leitura-nine.vercel.app',
];

// Middlewares
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());



app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Verificar status operacional da API
 *     description: Retorna o estado atual de integridade do servidor backend e timestamp da verificação.
 *     tags:
 *       - Sistema
 *     responses:
 *       200:
 *         description: API funcionando corretamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Sistema de Competição de Leitura - API em funcionamento!
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2026-11-24T10:00:00.000Z
 */
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

// Documentação Swagger (UI interativa e especificação em JSON)
app.get('/api-docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(swaggerSpec);
});

app.get('/api-docs', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>API Clube da Leitura - Swagger</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api-docs.json',
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: 'StandaloneLayout',
      });
    };
  </script>
</body>
</html>`);
});

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
    console.log(`📚 [Swagger] Documentação disponível em http://localhost:${PORT}/api-docs`);
  });
};

// Executar se chamado diretamente
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
