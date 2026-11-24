import { Router } from 'express';
import { authController } from '../controllers/authController';

const router = Router();

/**
 * @openapi
 * /api/auth/registrar:
 *   post:
 *     summary: Cadastrar novo usuário
 *     description: Cria uma nova conta no sistema para permitir acesso e participação nos grupos de leitura.
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - username
 *               - email
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *                 minLength: 2
 *                 example: Maria Silva
 *                 description: Nome do usuário (mínimo de 2 caracteres).
 *               username:
 *                 type: string
 *                 minLength: 2
 *                 pattern: '^[a-zA-Z0-9_.-]+$'
 *                 example: mariasilva
 *                 description: Nome de usuário único (apenas letras, números, _, - e .).
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maria@email.com
 *                 description: Endereço de e-mail válido e único.
 *               senha:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: senha123
 *                 description: Senha de acesso (mínimo de 6 caracteres).
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Usuário cadastrado com sucesso!
 *                 usuario:
 *                   $ref: '#/components/schemas/UsuarioResposta'
 *       400:
 *         description: Dados inválidos, campos obrigatórios ausentes ou usuário/e-mail já cadastrado.
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
router.post('/registrar', (req, res) => authController.registrar(req, res));

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Realizar login
 *     description: Autentica o usuário a partir de email ou username e senha, retornando um token JWT.
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identificador
 *               - senha
 *             properties:
 *               identificador:
 *                 type: string
 *                 example: mariasilva
 *                 description: Nome de usuário ou email cadastrado (também aceita a chave "email" ou "username").
 *               senha:
 *                 type: string
 *                 format: password
 *                 example: senha123
 *                 description: Senha de acesso.
 *     responses:
 *       200:
 *         description: Login realizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Login realizado com sucesso!
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 usuario:
 *                   $ref: '#/components/schemas/UsuarioResposta'
 *       400:
 *         description: Campos obrigatórios não fornecidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Credenciais incorretas (usuário ou senha incorretos).
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
router.post('/login', (req, res) => authController.login(req, res));

export default router;
