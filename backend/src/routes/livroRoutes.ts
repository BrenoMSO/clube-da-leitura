import { Router } from 'express';
import { livroController } from '../controllers/livroController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Rota protegida para buscar no Google Books através do backend
router.use(authMiddleware);

/**
 * @openapi
 * /api/livros/buscar:
 *   get:
 *     summary: Buscar livros no Google Books
 *     description: Consulta a API do Google Books a partir de um termo de pesquisa (título, autor ou palavra-chave) e retorna até 10 resultados formatados com capas em HTTPS.
 *     tags:
 *       - Livros
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Termo de busca para a pesquisa de livros.
 *         example: Senhor dos Aneis
 *     responses:
 *       200:
 *         description: Lista de livros encontrados.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LivroGoogleBooks'
 *       400:
 *         description: Parâmetro 'q' ausente ou vazio.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Não autenticado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Falha ao consultar o serviço externo do Google Books.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/buscar', (req, res) => livroController.buscar(req, res));

export default router;
