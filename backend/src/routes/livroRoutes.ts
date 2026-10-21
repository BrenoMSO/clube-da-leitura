import { Router } from 'express';
import { livroController } from '../controllers/livroController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Rota protegida para buscar no Google Books através do backend
router.use(authMiddleware);

router.get('/buscar', (req, res) => livroController.buscar(req, res));

export default router;
