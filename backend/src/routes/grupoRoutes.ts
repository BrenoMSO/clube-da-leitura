import { Router } from 'express';
import { grupoController } from '../controllers/grupoController';
import { leituraController } from '../controllers/leituraController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Todas as rotas de grupo são protegidas por autenticação JWT
router.use(authMiddleware);

/**
 * @openapi
 * /api/grupos:
 *   post:
 *     summary: Criar novo grupo de leitura
 *     description: Cria um grupo com código de convite único de 6 caracteres. O usuário criador é automaticamente adicionado como membro.
 *     tags:
 *       - Grupos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *             properties:
 *               nome:
 *                 type: string
 *                 minLength: 3
 *                 example: Clube de Ficção Científica
 *                 description: Nome do grupo (mínimo de 3 caracteres).
 *               descricao:
 *                 type: string
 *                 example: Leituras mensais de clássicos e novidades de ficção científica.
 *                 description: Descrição opcional dos objetivos ou regras do grupo.
 *     responses:
 *       201:
 *         description: Grupo criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Grupo criado com sucesso!
 *                 grupo:
 *                   $ref: '#/components/schemas/Grupo'
 *       400:
 *         description: Nome do grupo inválido ou menor que 3 caracteres.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token não fornecido ou inválido.
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
 *   get:
 *     summary: Listar grupos do usuário
 *     description: Retorna todos os grupos em que o usuário autenticado participa como membro ou criador.
 *     tags:
 *       - Grupos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de grupos retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Grupo'
 *       401:
 *         description: Não autenticado.
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
router.post('/', (req, res) => grupoController.criar(req, res));
router.get('/', (req, res) => grupoController.listar(req, res));

/**
 * @openapi
 * /api/grupos/entrar:
 *   post:
 *     summary: Entrar em um grupo
 *     description: Permite ao usuário autenticado ingressar em um grupo existente utilizando o código de convite de 6 caracteres.
 *     tags:
 *       - Grupos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigoConvite
 *             properties:
 *               codigoConvite:
 *                 type: string
 *                 example: ABC123
 *                 description: Código de convite alfanumérico de 6 caracteres do grupo.
 *     responses:
 *       200:
 *         description: Usuário ingressou no grupo com sucesso ou já era membro.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Você entrou no grupo com sucesso!
 *                 grupo:
 *                   $ref: '#/components/schemas/Grupo'
 *       400:
 *         description: Código de convite não informado.
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
 *       404:
 *         description: Nenhum grupo encontrado com o código fornecido.
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
router.post('/entrar', (req, res) => grupoController.entrar(req, res));

/**
 * @openapi
 * /api/grupos/{grupoId}/detalhes:
 *   get:
 *     summary: Obter detalhes do grupo e ranking
 *     description: Retorna as informações do grupo, o ranking de pontuação dos membros (páginas lidas) e as leituras registradas pelo usuário atual no grupo.
 *     tags:
 *       - Grupos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: grupoId
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador único do grupo (ObjectId do MongoDB).
 *         example: 65f1a2b3c4d5e6f7a8b9c0d2
 *     responses:
 *       200:
 *         description: Detalhes do grupo, ranking e histórico de leituras obtidos com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 grupo:
 *                   $ref: '#/components/schemas/Grupo'
 *                 ranking:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RankingItem'
 *                 minhasLeituras:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Leitura'
 *       400:
 *         description: ID de grupo com formato inválido.
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
 *         description: Usuário autenticado não é membro deste grupo.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Grupo não encontrado.
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
router.get('/:grupoId/detalhes', (req, res) => grupoController.detalhes(req, res));

/**
 * @openapi
 * /api/grupos/{grupoId}/leituras:
 *   post:
 *     summary: Adicionar livro/leitura ao grupo
 *     description: Registra um novo livro na lista de leituras do usuário autenticado dentro do grupo especificado.
 *     tags:
 *       - Grupos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: grupoId
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador do grupo (ObjectId).
 *         example: 65f1a2b3c4d5e6f7a8b9c0d2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tituloLivro
 *               - totalPaginas
 *             properties:
 *               tituloLivro:
 *                 type: string
 *                 example: Duna
 *                 description: Título da obra a ser lida.
 *               totalPaginas:
 *                 type: integer
 *                 minimum: 1
 *                 example: 680
 *                 description: Quantidade total de páginas do livro.
 *               autor:
 *                 type: string
 *                 example: Frank Herbert
 *                 description: Nome do autor (padrão 'Autor Desconhecido' se omitido).
 *               googleBookId:
 *                 type: string
 *                 example: zyTCAlFPjgYC
 *                 description: ID da API Google Books, caso tenha sido selecionado na busca.
 *               capaUrl:
 *                 type: string
 *                 example: https://books.google.com/books/content?id=zyTCAlFPjgYC&printsec=frontcover&img=1
 *                 description: URL da capa do livro.
 *     responses:
 *       201:
 *         description: Livro adicionado ao grupo com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Livro adicionado ao grupo com sucesso!
 *                 leitura:
 *                   $ref: '#/components/schemas/Leitura'
 *       400:
 *         description: Título ausente, total de páginas inválido ou ID de grupo incorreto.
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
 *         description: Usuário não é membro deste grupo.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Grupo não encontrado.
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
router.post('/:grupoId/leituras', (req, res) => leituraController.registrarNoGrupo(req, res));

export default router;
