import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Grupo, gerarCodigoConvite } from '../models/Grupo';
import { Leitura } from '../models/Leitura';
import { getParamString } from '../utils/params';

export class GrupoController {
  async criar(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuarioId;
      const { nome, descricao } = req.body;

      if (!usuarioId) {
        res.status(401).json({ mensagem: 'Usuário não autenticado.' });
        return;
      }

      if (!nome || typeof nome !== 'string' || nome.trim().length < 3) {
        res.status(400).json({ mensagem: 'O nome do grupo deve ter pelo menos 3 caracteres.' });
        return;
      }

      // Garantir código de convite único
      let codigo = gerarCodigoConvite();
      let existente = await Grupo.findOne({ codigoConvite: codigo });
      while (existente) {
        codigo = gerarCodigoConvite();
        existente = await Grupo.findOne({ codigoConvite: codigo });
      }

      const novoGrupo = await Grupo.create({
        nome: nome.trim(),
        descricao: descricao ? String(descricao).trim() : '',
        codigoConvite: codigo,
        criadorId: new Types.ObjectId(usuarioId),
        membros: [new Types.ObjectId(usuarioId)],
      });

      const grupoPopulato = await Grupo.findById(novoGrupo._id)
        .populate('criadorId', 'nome email')
        .populate('membros', 'nome email');

      res.status(201).json({
        mensagem: 'Grupo criado com sucesso!',
        grupo: grupoPopulato,
      });
    } catch (error: any) {
      res.status(500).json({
        mensagem: 'Erro interno ao criar grupo.',
        detalhes: error.message,
      });
    }
  }

  async listar(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuarioId;

      if (!usuarioId) {
        res.status(401).json({ mensagem: 'Usuário não autenticado.' });
        return;
      }

      const grupos = await Grupo.find({
        membros: new Types.ObjectId(usuarioId),
      })
        .populate('criadorId', 'nome email')
        .populate('membros', 'nome email')
        .sort({ createdAt: -1 });

      res.status(200).json(grupos);
    } catch (error: any) {
      res.status(500).json({
        mensagem: 'Erro interno ao listar grupos.',
        detalhes: error.message,
      });
    }
  }

  async entrar(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuarioId;
      const { codigoConvite } = req.body;

      if (!usuarioId) {
        res.status(401).json({ mensagem: 'Usuário não autenticado.' });
        return;
      }

      if (!codigoConvite || typeof codigoConvite !== 'string') {
        res.status(400).json({ mensagem: 'Código de convite é obrigatório.' });
        return;
      }

      const codigoLimpo = codigoConvite.trim().toUpperCase();
      const grupo = await Grupo.findOne({ codigoConvite: codigoLimpo });

      if (!grupo) {
        res.status(404).json({ mensagem: 'Grupo não encontrado com o código fornecido.' });
        return;
      }

      const jaMembro = grupo.membros.some(
        (membroId) => membroId.toString() === usuarioId
      );

      if (jaMembro) {
        res.status(200).json({
          mensagem: 'Você já faz parte deste grupo.',
          grupo,
        });
        return;
      }

      grupo.membros.push(new Types.ObjectId(usuarioId));
      await grupo.save();

      const grupoAtualizado = await Grupo.findById(grupo._id)
        .populate('criadorId', 'nome email')
        .populate('membros', 'nome email');

      res.status(200).json({
        mensagem: 'Você entrou no grupo com sucesso!',
        grupo: grupoAtualizado,
      });
    } catch (error: any) {
      res.status(500).json({
        mensagem: 'Erro interno ao entrar no grupo.',
        detalhes: error.message,
      });
    }
  }

  async detalhes(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuarioId;
      const grupoId = getParamString(req.params.grupoId);

      if (!usuarioId) {
        res.status(401).json({ mensagem: 'Usuário não autenticado.' });
        return;
      }

      if (!grupoId || !Types.ObjectId.isValid(grupoId)) {
        res.status(400).json({ mensagem: 'ID de grupo inválido.' });
        return;
      }

      const grupo = await Grupo.findById(grupoId)
        .populate('criadorId', 'nome email')
        .populate('membros', 'nome email');

      if (!grupo) {
        res.status(404).json({ mensagem: 'Grupo não encontrado.' });
        return;
      }

      const usuarioPertenceAoGrupo = grupo.membros.some(
        (membro: any) => membro._id.toString() === usuarioId
      );

      if (!usuarioPertenceAoGrupo) {
        res.status(403).json({ mensagem: 'Você não tem permissão para visualizar este grupo.' });
        return;
      }

      // Buscar todas as leituras deste grupo para calcular o ranking
      const todasLeituras = await Leitura.find({ grupoId: new Types.ObjectId(grupoId) })
        .populate('usuarioId', 'nome email');

      // Calcular o ranking: agrupar paginasLidas por membro do grupo
      const pontuacaoPorUsuario: Record<string, { nome: string; email: string; pontos: number; totalLivros: number }> = {};

      // Inicializa todos os membros com 0 pontos para que todos apareçam no ranking
      grupo.membros.forEach((membro: any) => {
        pontuacaoPorUsuario[membro._id.toString()] = {
          nome: membro.nome,
          email: membro.email,
          pontos: 0,
          totalLivros: 0,
        };
      });

      todasLeituras.forEach((leitura: any) => {
        const uId = leitura.usuarioId?._id?.toString() || leitura.usuarioId?.toString();
        if (pontuacaoPorUsuario[uId]) {
          pontuacaoPorUsuario[uId].pontos += leitura.paginasLidas || 0;
          pontuacaoPorUsuario[uId].totalLivros += 1;
        }
      });

      const ranking = Object.entries(pontuacaoPorUsuario)
        .map(([uId, dados]) => ({
          usuarioId: uId,
          nome: dados.nome,
          email: dados.email,
          pontos: dados.pontos,
          totalLivros: dados.totalLivros,
        }))
        .sort((a, b) => b.pontos - a.pontos)
        .map((item, index) => ({
          posicao: index + 1,
          ...item,
        }));

      // Separar as leituras do usuário logado neste grupo
      const minhasLeituras = todasLeituras
        .filter((l: any) => {
          const uId = l.usuarioId?._id?.toString() || l.usuarioId?.toString();
          return uId === usuarioId;
        })
        .sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());

      res.status(200).json({
        grupo: {
          _id: grupo._id,
          nome: grupo.nome,
          descricao: grupo.descricao,
          codigoConvite: grupo.codigoConvite,
          criadorId: grupo.criadorId,
          membros: grupo.membros,
          createdAt: grupo.createdAt,
        },
        ranking,
        minhasLeituras,
      });
    } catch (error: any) {
      res.status(500).json({
        mensagem: 'Erro interno ao buscar detalhes do grupo.',
        detalhes: error.message,
      });
    }
  }
}

export const grupoController = new GrupoController();
