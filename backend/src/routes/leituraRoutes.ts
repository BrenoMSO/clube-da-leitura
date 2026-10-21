import { Router } from 'express';
import { leituraController } from '../controllers/leituraController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Todas as rotas de leitura são protegidas por autenticação JWT
router.use(authMiddleware);

router.patch('/:leituraId/progresso', (req, res) =>
  leituraController.atualizarProgresso(req, res)
);

router.patch('/:leituraId/avaliar', (req, res) =>
  leituraController.avaliar(req, res)
);

export default router;
