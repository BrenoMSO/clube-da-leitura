import { Request, Response } from 'express';
import { googleBooksService } from '../services/googleBooksService';

export class LivroController {
  async buscar(req: Request, res: Response): Promise<void> {
    try {
      const termo = req.query.q;

      if (!termo || typeof termo !== 'string' || termo.trim().length === 0) {
        res.status(400).json({ mensagem: 'O parâmetro de busca "q" é obrigatório.' });
        return;
      }

      const livros = await googleBooksService.buscarLivros(termo);
      res.status(200).json(livros);
    } catch (error: any) {
      res.status(500).json({
        mensagem: 'Erro ao buscar livros no Google Books.',
        detalhes: error.message,
      });
    }
  }
}

export const livroController = new LivroController();
