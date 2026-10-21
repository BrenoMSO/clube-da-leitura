import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Leitura } from '../models/Leitura';
import { Grupo } from '../models/Grupo';
import { getParamString } from '../utils/params';

export class LeituraController {
  async registrarNoGrupo(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuarioId;
      const grupoId = getParamString(req.params.grupoId);
      const { googleBookId, tituloLivro, autor, capaUrl, totalPaginas } = req.body;

      if (!usuarioId) {
        res.status(401).json({ mensagem: 'Usuário não autenticado.' });
        return;
      }

      if (!grupoId || !Types.ObjectId.isValid(grupoId)) {
        res.status(400).json({ mensagem: 'ID de grupo inválido.' });
        return;
      }

      const grupo = await Grupo.findById(grupoId);
      if (!grupo) {
        res.status(404).json({ mensagem: 'Grupo não encontrado.' });
        return;
      }

      const pertenceAoGrupo = grupo.membros.some(
        (membroId) => membroId.toString() === usuarioId
      );

      if (!pertenceAoGrupo) {
        res.status(403).json({
          mensagem: 'Você precisa ser membro deste grupo para registrar leituras nele.',
        });
        return;
      }

      if (!tituloLivro || typeof tituloLivro !== 'string' || tituloLivro.trim().length === 0) {
        res.status(400).json({ mensagem: 'O título do livro é obrigatório.' });
        return;
      }

      const totalPaginasNum = Number(totalPaginas);
      if (isNaN(totalPaginasNum) || totalPaginasNum <= 0) {
        res.status(400).json({
          mensagem: 'O total de páginas deve ser um número maior que zero.',
        });
        return;
      }

      const novaLeitura = await Leitura.create({
        usuarioId: new Types.ObjectId(usuarioId),
        grupoId: new Types.ObjectId(grupoId),
        googleBookId: googleBookId || '',
        tituloLivro: tituloLivro.trim(),
        autor: autor ? String(autor).trim() : 'Autor Desconhecido',
        capaUrl: capaUrl || '',
        totalPaginas: totalPaginasNum,
        paginasLidas: 0,
        concluido: false,
      });

      res.status(201).json({
        mensagem: 'Livro adicionado ao grupo com sucesso!',
        leitura: novaLeitura,
      });
    } catch (error: any) {
      res.status(500).json({
        mensagem: 'Erro interno ao registrar leitura no grupo.',
        detalhes: error.message,
      });
    }
  }

  async atualizarProgresso(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuarioId;
      const leituraId = getParamString(req.params.leituraId);
      const { paginasLidas } = req.body;

      if (!usuarioId) {
        res.status(401).json({ mensagem: 'Usuário não autenticado.' });
        return;
      }

      if (!leituraId || !Types.ObjectId.isValid(leituraId)) {
        res.status(400).json({ mensagem: 'ID de leitura inválido.' });
        return;
      }

      const leitura = await Leitura.findById(leituraId);
      if (!leitura) {
        res.status(404).json({ mensagem: 'Registro de leitura não encontrado.' });
        return;
      }

      if (leitura.usuarioId.toString() !== usuarioId) {
        res.status(403).json({
          mensagem: 'Você não tem permissão para alterar o progresso desta leitura.',
        });
        return;
      }

      const paginasNum = Number(paginasLidas);
      if (isNaN(paginasNum) || paginasNum < 0) {
        res.status(400).json({
          mensagem: 'A quantidade de páginas lidas deve ser um número maior ou igual a zero.',
        });
        return;
      }

      if (paginasNum > leitura.totalPaginas) {
        res.status(400).json({
          mensagem: `A quantidade de páginas lidas (${paginasNum}) não pode ultrapassar o total do livro (${leitura.totalPaginas}).`,
        });
        return;
      }

      leitura.paginasLidas = paginasNum;
      // Regra de conclusão automática
      if (paginasNum === leitura.totalPaginas) {
        leitura.concluido = true;
      } else {
        leitura.concluido = false;
        // Se desmarcou conclusão, remove a avaliação se houver
        leitura.avaliacao = undefined;
      }

      await leitura.save();

      res.status(200).json({
        mensagem: 'Progresso atualizado com sucesso!',
        leitura,
      });
    } catch (error: any) {
      res.status(500).json({
        mensagem: 'Erro interno ao atualizar progresso da leitura.',
        detalhes: error.message,
      });
    }
  }

  async avaliar(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuarioId;
      const leituraId = getParamString(req.params.leituraId);
      const { avaliacao } = req.body;

      if (!usuarioId) {
        res.status(401).json({ mensagem: 'Usuário não autenticado.' });
        return;
      }

      if (!leituraId || !Types.ObjectId.isValid(leituraId)) {
        res.status(400).json({ mensagem: 'ID de leitura inválido.' });
        return;
      }

      const leitura = await Leitura.findById(leituraId);
      if (!leitura) {
        res.status(404).json({ mensagem: 'Registro de leitura não encontrado.' });
        return;
      }

      if (leitura.usuarioId.toString() !== usuarioId) {
        res.status(403).json({
          mensagem: 'Você não tem permissão para avaliar esta leitura.',
        });
        return;
      }

      if (!leitura.concluido) {
        res.status(400).json({
          mensagem: 'Você só pode avaliar um livro quando a leitura estiver concluída (100%).',
        });
        return;
      }

      const nota = Number(avaliacao);
      if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
        res.status(400).json({
          mensagem: 'A avaliação deve ser um número inteiro entre 1 e 5 estrelas.',
        });
        return;
      }

      leitura.avaliacao = nota;
      await leitura.save();

      res.status(200).json({
        mensagem: 'Avaliação registrada com sucesso!',
        leitura,
      });
    } catch (error: any) {
      res.status(500).json({
        mensagem: 'Erro interno ao avaliar leitura.',
        detalhes: error.message,
      });
    }
  }
}

export const leituraController = new LeituraController();
