import type { Request, Response } from "express";
import { prisma } from "../database/prisma.js";

export class ArticleController {
  async index(req: Request, res: Response): Promise<void> {
    try {
      const articles = await prisma.article.findMany({
        orderBy: { publishedAt: "desc" },
        include: {
          author: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      });

      // Converte a imagem (BLOB) para string/base64 adequada para que o frontend exiba corretamente
      const formattedArticles = articles.map((article) => {
        let finalImage = null;
        if (article.bannerImage) {
          const rawStr = Buffer.from(article.bannerImage).toString("utf-8");
          if (
            rawStr.startsWith("data:") ||
            rawStr.startsWith("http:") ||
            rawStr.startsWith("https:") ||
            rawStr.startsWith("uploads/") ||
            rawStr.startsWith("/")
          ) {
            finalImage = rawStr;
          } else {
            finalImage = `data:image/jpeg;base64,${Buffer.from(article.bannerImage).toString("base64")}`;
          }
        }
        let finalAvatar = null;
        if (article.author?.avatar) {
          const rawAvStr = Buffer.from(article.author.avatar).toString("utf-8");
          if (
            rawAvStr.startsWith("data:") ||
            rawAvStr.startsWith("http:") ||
            rawAvStr.startsWith("https:") ||
            rawAvStr.startsWith("uploads/") ||
            rawAvStr.startsWith("/")
          ) {
            finalAvatar = rawAvStr;
          } else {
            finalAvatar = `data:image/jpeg;base64,${Buffer.from(article.author.avatar).toString("base64")}`;
          }
        }

        return {
          ...article,
          bannerImage: finalImage,
          author: {
            ...article.author,
            avatar: finalAvatar,
          },
        };
      });

      res.status(200).json(formattedArticles);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao buscar artigos." });
    }
  }

  async show(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const article = await prisma.article.findUnique({
        where: { id: Number(id) },
        include: {
          author: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      });

      if (!article) {
        res.status(404).json({ error: "Artigo não encontrado." });
        return;
      }

      let finalImage = null;
      if (article.bannerImage) {
        const rawStr = Buffer.from(article.bannerImage).toString("utf-8");
        if (
          rawStr.startsWith("data:") ||
          rawStr.startsWith("http:") ||
          rawStr.startsWith("https:") ||
          rawStr.startsWith("uploads/") ||
          rawStr.startsWith("/")
        ) {
          finalImage = rawStr;
        } else {
          finalImage = `data:image/jpeg;base64,${Buffer.from(article.bannerImage).toString("base64")}`;
        }
      }

      let finalAvatar = null;
      if (article.author?.avatar) {
        const rawAvStr = Buffer.from(article.author.avatar).toString("utf-8");
        if (
          rawAvStr.startsWith("data:") ||
          rawAvStr.startsWith("http:") ||
          rawAvStr.startsWith("https:") ||
          rawAvStr.startsWith("uploads/") ||
          rawAvStr.startsWith("/")
        ) {
          finalAvatar = rawAvStr;
        } else {
          finalAvatar = `data:image/jpeg;base64,${Buffer.from(article.author.avatar).toString("base64")}`;
        }
      }

      const formattedArticle = {
        ...article,
        bannerImage: finalImage,
        author: {
          ...article.author,
          avatar: finalAvatar,
        },
      };

      res.status(200).json(formattedArticle);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao buscar o artigo." });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { title, content, bannerImage } = req.body;
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
      } else if (bannerImage) {
        dataToCreate.bannerImage = Buffer.from(String(bannerImage), "utf-8");
      }

      const article = await prisma.article.create({
        data: dataToCreate,
      });

      res.status(201).json({ message: "Artigo criado com sucesso!", article });
    } catch (error: any) {
      console.error("Erro ao criar artigo:", error);
      res.status(500).json({ error: error?.message || "Erro interno ao criar o artigo." });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, content, bannerImage } = req.body;
      const authorId = req.userId;

      const article = await prisma.article.findUnique({
        where: { id: Number(id) },
      });

      if (!article) {
        res.status(404).json({ error: "Artigo não encontrado." });
        return;
      }

      const dataToUpdate: any = {
        title: title || article.title,
        content: content || article.content,
      };

      if (req.file) {
        dataToUpdate.bannerImage = new Uint8Array(req.file.buffer);
      } else if (bannerImage) {
        dataToUpdate.bannerImage = Buffer.from(String(bannerImage), "utf-8");
      }

      const updatedArticle = await prisma.article.update({
        where: { id: Number(id) },
        data: dataToUpdate,
      });

      res.status(200).json({ message: "Artigo atualizado com sucesso!", article: updatedArticle });
    } catch (error: any) {
      console.error("Erro ao atualizar artigo:", error);
      res.status(500).json({ error: error?.message || "Erro interno ao atualizar o artigo." });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const article = await prisma.article.findUnique({
        where: { id: Number(id) },
      });

      if (!article) {
        res.status(404).json({ error: "Artigo não encontrado." });
        return;
      }

      // Remove o artigo diretamente do banco de dados MySQL
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
