import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuario } from '../models/Usuario';

const escapeRegex = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export class AuthController {
  async registrar(req: Request, res: Response): Promise<void> {
    try {
      const { nome, username, email, senha } = req.body;

      if (!nome || !username || !email || !senha) {
        res.status(400).json({ mensagem: 'Nome, usuário, email e senha são obrigatórios.' });
        return;
      }

      if (typeof nome !== 'string' || nome.trim().length < 2) {
        res.status(400).json({ mensagem: 'O nome deve ter pelo menos 2 caracteres.' });
        return;
      }

      if (typeof username !== 'string' || username.trim().length < 2) {
        res.status(400).json({ mensagem: 'O nome de usuário deve ter pelo menos 2 caracteres.' });
        return;
      }

      const usernameNormalizado = username.trim();
      const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
      if (!usernameRegex.test(usernameNormalizado)) {
        res.status(400).json({
          mensagem: 'O nome de usuário deve conter apenas letras, números, sublinhados (_), hífens (-) ou pontos (.).',
        });
        return;
      }

      if (typeof email !== 'string') {
        res.status(400).json({ mensagem: 'Por favor, informe um email válido.' });
        return;
      }

      const emailNormalizado = email.toLowerCase().trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailNormalizado)) {
        res.status(400).json({ mensagem: 'Por favor, informe um email válido.' });
        return;
      }

      if (typeof senha !== 'string' || senha.length < 6) {
        res.status(400).json({ mensagem: 'A senha deve ter pelo menos 6 caracteres.' });
        return;
      }

      const usernameExistente = await Usuario.findOne({
        username: { $regex: new RegExp(`^${escapeRegex(usernameNormalizado)}$`, 'i') },
      });

      if (usernameExistente) {
        res.status(400).json({ mensagem: 'Já existe um usuário com este nome de usuário.' });
        return;
      }

      const usuarioExistente = await Usuario.findOne({ email: emailNormalizado });

      if (usuarioExistente) {
        res.status(400).json({ mensagem: 'Já existe uma conta cadastrada com este email.' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash(senha, salt);

      const novoUsuario = await Usuario.create({
        nome: nome.trim(),
        username: usernameNormalizado,
        email: emailNormalizado,
        senha: senhaHash,
      });

      res.status(201).json({
        mensagem: 'Usuário cadastrado com sucesso!',
        usuario: {
          id: novoUsuario._id,
          nome: novoUsuario.nome,
          username: novoUsuario.username,
          email: novoUsuario.email,
          createdAt: novoUsuario.createdAt,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        mensagem: 'Erro interno ao registrar usuário.',
        detalhes: error.message,
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { identificador, email, username, senha } = req.body;

      const valorIdentificador = identificador ?? email ?? username;

      if (!valorIdentificador || !senha || typeof valorIdentificador !== 'string' || typeof senha !== 'string') {
        res.status(400).json({ mensagem: 'Email/Usuário e senha são obrigatórios.' });
        return;
      }

      const termoBusca = valorIdentificador.trim();
      if (!termoBusca) {
        res.status(400).json({ mensagem: 'Email/Usuário e senha são obrigatórios.' });
        return;
      }

      const usuario = await Usuario.findOne({
        $or: [
          { email: termoBusca.toLowerCase() },
          { username: { $regex: new RegExp(`^${escapeRegex(termoBusca)}$`, 'i') } },
        ],
      });

      if (!usuario) {
        res.status(401).json({ mensagem: 'Credenciais incorretas.' });
        return;
      }

      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
      if (!senhaCorreta) {
        res.status(401).json({ mensagem: 'Credenciais incorretas.' });
        return;
      }

      const secret = process.env.JWT_SECRET || 'minha_chave_secreta_super_segura_mvp_123';
      const token = jwt.sign(
        { id: usuario._id.toString() },
        secret,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        mensagem: 'Login realizado com sucesso!',
        token,
        usuario: {
          id: usuario._id,
          nome: usuario.nome,
          username: usuario.username,
          email: usuario.email,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        mensagem: 'Erro interno ao realizar login.',
        detalhes: error.message,
      });
    }
  }
}

export const authController = new AuthController();
