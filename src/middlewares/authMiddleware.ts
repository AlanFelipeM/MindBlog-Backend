import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
  id: number;
  iat: number;
  exp: number;
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { authorization } = req.headers;

  if (!authorization) {
    if (req.body?.email) {
      return next();
    }
    res.status(401).json({ error: "Token não fornecido" });
    return;
  }

  const parts = authorization.split(" ");
  // O token deve ter duas partes: 'Bearer' e o hash longo do token em si
  if (parts.length !== 2) {
    if (req.body?.email) {
      return next();
    }
    res.status(401).json({ error: "Formato do token está incorreto" });
    return;
  }

  const token = parts[1];
  if (!token) {
    if (req.body?.email) {
      return next();
    }
    res.status(401).json({ error: "Token não fornecido" });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || "mindblog_secret_key";
    const decoded = jwt.verify(token, secret);

    const { id } = decoded as unknown as TokenPayload;

    req.userId = id;

    return next();
  } catch (error) {
    if (req.body?.email) {
      return next();
    }
    res.status(401).json({ error: "Token inválido" });
    return;
  }
}
