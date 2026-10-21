import { Router } from 'express';
import { grupoController } from '../controllers/grupoController';
import { leituraController } from '../controllers/leituraController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Todas as rotas de grupo são protegidas por autenticação JWT
router.use(authMiddleware);

router.post('/', (req, res) => grupoController.criar(req, res));
router.get('/', (req, res) => grupoController.listar(req, res));
router.post('/entrar', (req, res) => grupoController.entrar(req, res));
router.get('/:grupoId/detalhes', (req, res) => grupoController.detalhes(req, res));
router.post('/:grupoId/leituras', (req, res) => leituraController.registrarNoGrupo(req, res));

export default router;
