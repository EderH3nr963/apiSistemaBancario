import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Defina a sua chave secreta em variáveis de ambiente
const SECRET_KEY = process.env.JWT_SECRET || "chave_super_secreta";

export interface AuthRequest extends Request {
  user?: any; // aqui você pode tipar melhor se souber o formato do payload
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // pega o token depois de "Bearer "

  if (!token) {
    res.status(401).json({ msg: "Token não fornecido" });
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY); // valida token
    req.user = decoded; // coloca o payload no request para usar nos controllers
    next();
  } catch (err) {
    res.status(403).json({ status: "error", msg: "Token inválido ou expirado" });
    return;
  }
}
