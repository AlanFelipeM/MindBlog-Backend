import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../database/prisma.js";

export class UserController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({ error: "Nome, email e senha são obrigatórios." });
        return;
      }

      // Verifica se o usuário já existe no banco
      const userExists = await prisma.user.findUnique({
        where: { email },
      });

      if (userExists) {
        res.status(400).json({ error: "Este email já está em uso." });
        return;
      }

      // Criptografa a senha (o fator 10 é o padrão seguro)
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      // Remove a senha do objeto antes de enviar a resposta para segurança
      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json({
        message: "Usuário criado com sucesso!",
        user: userWithoutPassword,
      });
    } catch (error: any) {
      console.error('Erro em register:', error);
      const isDbError = String(error?.message).includes('prisma') || String(error?.message).includes('database') || String(error?.message).includes('Can\'t reach');
      res.status(500).json({ 
        error: isDbError 
          ? "Servidor de banco de dados temporariamente indisponível. Tente novamente em instantes." 
          : (error?.message || 'Erro interno do servidor.') 
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email e senha são obrigatórios." });
        return;
      }

      // Busca o usuário no banco de dados
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        res.status(401).json({ error: "Credenciais inválidas." });
        return;
      }

      // Verifica se a senha enviada bate com a senha criptografada
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        res.status(401).json({ error: "Credenciais inválidas." });
        return;
      }

      // Gera o token JWT para manter o usuário logado
      const secret = process.env.JWT_SECRET || "mindblog_secret_key";
      const token = jwt.sign({ id: user.id }, secret, {
        expiresIn: "1d",
      });

      const { password: _, ...userWithoutPassword } = user;

      res.status(200).json({
        message: "Login realizado com sucesso!",
        user: userWithoutPassword,
        token,
      });
    } catch (error: any) {
      console.error('Erro em login:', error);
      const isDbError = String(error?.message).includes('prisma') || String(error?.message).includes('database') || String(error?.message).includes('Can\'t reach');
      res.status(500).json({ 
        error: isDbError 
          ? "Servidor de banco de dados temporariamente indisponível. Tente novamente em instantes." 
          : (error?.message || 'Erro interno do servidor.') 
      });
    }
  }

  // Exclui a conta do usuário autenticado e seus artigos vinculados no banco de dados
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const rawEmail = req.body?.email ? String(req.body.email).trim() : '';

      let deletedCount = 0;

      // 1. Apaga por userId se fornecido no JWT
      if (userId) {
        await prisma.article.deleteMany({ where: { authorId: userId } });
        try {
          await prisma.user.delete({ where: { id: userId } });
          deletedCount++;
        } catch (e) {
          // Ignora se já tiver sido removido
        }
      }

      // 2. Apaga por E-mail (garante remoção mesmo para contas antigas ou criadas em sessões anteriores)
      if (rawEmail) {
        const usersFound = await prisma.user.findMany({
          where: { email: rawEmail },
        });

        for (const u of usersFound) {
          await prisma.article.deleteMany({ where: { authorId: u.id } });
          try {
            await prisma.user.delete({ where: { id: u.id } });
            deletedCount++;
          } catch (e) {
            // Ignora duplicados já apagados
          }
        }
      }

      res.status(200).json({ message: "Conta excluída com sucesso.", deletedCount });
    } catch (error: any) {
      console.error('Erro ao excluir conta de usuário:', error);
      res.status(500).json({ error: "Erro ao excluir conta do sistema." });
    }
  }
}
