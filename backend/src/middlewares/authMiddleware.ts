import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ mensagem: 'Acesso não autorizado. Token não fornecido.' });
    return;
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({ mensagem: 'Formato de token inválido. Esperado: Bearer <token>.' });
    return;
  }

  const token = parts[1];
  const secret = process.env.JWT_SECRET || 'minha_chave_secreta_super_segura_mvp_123';

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    req.usuarioId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ mensagem: 'Token inválido ou expirado.' });
  }
};
