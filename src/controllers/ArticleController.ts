import type { Request, Response } from "express";
import { prisma } from "../database/prisma.js";

export class ArticleController {
  async index(req: Request, res: Response): Promise<void> {
    try {
      const articles = await prisma.article.findMany({
        orderBy: { publishedAt: "desc" },
        include: {
          author: {
            select: { name: true, email: true },
          },
        },
      });

      // Convert bannerImage to base64 if it exists so the frontend can easily display it
      const formattedArticles = articles.map((article) => {
        let base64Image = null;
        if (article.bannerImage) {
          base64Image = `data:image/jpeg;base64,${Buffer.from(article.bannerImage).toString("base64")}`;
        }
        return {
          ...article,
          bannerImage: base64Image,
        };
      });

      res.status(200).json(formattedArticles);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao buscar artigos." });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { title, content } = req.body;
      const authorId = req.userId;

      if (!title || !content) {
        res.status(400).json({ error: "Título e conteúdo são obrigatórios." });
        return;
      }

      if (!authorId) {
        res.status(401).json({ error: "Usuário não autenticado." });
        return;
      }

      const dataToCreate: any = {
        title,
        content,
        authorId,
      };

      if (req.file) {
        dataToCreate.bannerImage = new Uint8Array(req.file.buffer);
      }

      const article = await prisma.article.create({
        data: dataToCreate,
      });

      res.status(201).json({ message: "Artigo criado com sucesso!", article });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro interno ao criar o artigo." });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, content } = req.body;
      const authorId = req.userId;

      const article = await prisma.article.findUnique({
        where: { id: Number(id) },
      });

      if (!article) {
        res.status(404).json({ error: "Artigo não encontrado." });
        return;
      }

      // Check ownership
      if (article.authorId !== authorId) {
        res.status(403).json({ error: "Você não tem permissão para editar este artigo." });
        return;
      }

      const dataToUpdate: any = {
        title: title || article.title,
        content: content || article.content,
      };

      if (req.file) {
        dataToUpdate.bannerImage = new Uint8Array(req.file.buffer);
      }

      const updatedArticle = await prisma.article.update({
        where: { id: Number(id) },
        data: dataToUpdate,
      });

      res.status(200).json({ message: "Artigo atualizado com sucesso!", article: updatedArticle });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro interno ao atualizar o artigo." });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const authorId = req.userId;

      const article = await prisma.article.findUnique({
        where: { id: Number(id) },
      });

      if (!article) {
        res.status(404).json({ error: "Artigo não encontrado." });
        return;
      }

      // Check ownership
      if (article.authorId !== authorId) {
        res.status(403).json({ error: "Você não tem permissão para remover este artigo." });
        return;
      }

      await prisma.article.delete({
        where: { id: Number(id) },
      });

      res.status(200).json({ message: "Artigo removido com sucesso!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro interno ao remover o artigo." });
    }
  }
}
