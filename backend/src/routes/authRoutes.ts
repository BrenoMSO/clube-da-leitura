import { Router } from 'express';
import { authController } from '../controllers/authController';

const router = Router();

router.post('/registrar', (req, res) => authController.registrar(req, res));
router.post('/login', (req, res) => authController.login(req, res));

export default router;
