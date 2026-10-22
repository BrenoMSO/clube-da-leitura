import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuario } from '../models/Usuario';

export class AuthController {
  async registrar(req: Request, res: Response): Promise<void> {
    try {
      const { nome, username, email, senha } = req.body;

      if (!nome || !email || !senha || username) {
        res.status(400).json({ mensagem: 'Nome, usuário, email e senha são obrigatórios.' });
        return;
      }

      if (senha.length < 6) {
        res.status(400).json({ mensagem: 'A senha deve ter pelo menos 6 caracteres.' });
        return;
      }

      const emailNormalizado = email.toLowerCase().trim();
      const usuarioExistente = await Usuario.findOne({ email: emailNormalizado });
      const usernameExistente = await Usuario.findOne({ username: username});

      if (usernameExistente) {
        res.status(400).json({mensagem: 'Já existe um usuário com este nome'});
        return;
      }

      if (usuarioExistente) {
        res.status(400).json({ mensagem: 'Já existe uma conta cadastrada com este email.' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash(senha, salt);

      const novoUsuario = await Usuario.create({
        nome: nome.trim(),
        username: username.trim(),
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
      const { email, senha, username } = req.body;

      if (!email || !senha) {
        res.status(400).json({ mensagem: 'Email/Usuário e senha são obrigatórios.' });
        return;
      } else if ( !username || !senha) {
        res.status(400).json({mensagem: 'Email/Usuário e senha são obrigatórios'});
        return;
      }

      const emailNormalizado = email.toLowerCase().trim();
      const usuario = await Usuario.findOne({ email: emailNormalizado });

      if (!usuario) {
        res.status(401).json({ mensagem: 'Email ou senha incorretos.' });
        return;
      }

      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
      if (!senhaCorreta) {
        res.status(401).json({ mensagem: 'Email ou senha incorretos.' });
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
