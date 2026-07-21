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
    res.status(401).json({ error: "Token não fornecido" });
    return;
  }

  const parts = authorization.split(" ");
  if (parts.length !== 2) {
    res.status(401).json({ error: "Token format error" });
    return;
  }

  const token = parts[1];
  if (!token) {
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
    res.status(401).json({ error: "Token inválido" });
    return;
  }
}
