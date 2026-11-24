import { Router } from 'express';
import { leituraController } from '../controllers/leituraController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Todas as rotas de leitura são protegidas por autenticação JWT
router.use(authMiddleware);

/**
 * @openapi
 * /api/leituras/{leituraId}/progresso:
 *   patch:
 *     summary: Atualizar progresso de páginas lidas
 *     description: Atualiza a contagem de páginas lidas de uma leitura. Se as páginas lidas atingirem o total, o status concluído é automaticamente marcado como true.
 *     tags:
 *       - Leituras
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: leituraId
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador único da leitura (ObjectId).
 *         example: 65f1a2b3c4d5e6f7a8b9c0d3
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paginasLidas
 *             properties:
 *               paginasLidas:
 *                 type: integer
 *                 minimum: 0
 *                 example: 340
 *                 description: Quantidade atualizada de páginas concluídas até o momento.
 *     responses:
 *       200:
 *         description: Progresso atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Progresso atualizado com sucesso!
 *                 leitura:
 *                   $ref: '#/components/schemas/Leitura'
 *       400:
 *         description: Quantidade de páginas inválida, negativa ou maior que o total do livro.
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
 *       403:
 *         description: A leitura informada pertence a outro usuário.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Registro de leitura não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno no servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:leituraId/progresso', (req, res) =>
  leituraController.atualizarProgresso(req, res)
);

/**
 * @openapi
 * /api/leituras/{leituraId}/avaliar:
 *   patch:
 *     summary: Avaliar leitura concluída
 *     description: Atribui uma nota de 1 a 5 estrelas para um livro concluído (100% lido).
 *     tags:
 *       - Leituras
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: leituraId
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador único da leitura (ObjectId).
 *         example: 65f1a2b3c4d5e6f7a8b9c0d3
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - avaliacao
 *             properties:
 *               avaliacao:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *                 description: Nota inteira de avaliação entre 1 e 5 estrelas.
 *     responses:
 *       200:
 *         description: Avaliação registrada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Avaliação registrada com sucesso!
 *                 leitura:
 *                   $ref: '#/components/schemas/Leitura'
 *       400:
 *         description: O livro ainda não foi concluído ou a nota é inválida.
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
 *       403:
 *         description: A leitura informada pertence a outro usuário.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Registro de leitura não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno no servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:leituraId/avaliar', (req, res) =>
  leituraController.avaliar(req, res)
);

export default router;
