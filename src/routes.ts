import { Router } from "express";
import multer from "multer";
import { UserController } from "./controllers/UserController.js";
import { ArticleController } from "./controllers/ArticleController.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";

const router = Router();
const userController = new UserController();
const articleController = new ArticleController();

// Configura o multer para armazenar as imagens temporariamente na memória (necessário para salvar como BLOB no MySQL)
const upload = multer({ storage: multer.memoryStorage() });

// Rotas de Usuário (Autenticação e Perfil)
router.post("/users/register", userController.register);
router.post("/users/login", userController.login);
router.delete("/users/me", authMiddleware, userController.delete);
router.post("/users/delete", userController.delete);

// Rota Pública de Artigos (Qualquer um pode ver a listagem ou um artigo específico)
router.get("/articles", articleController.index);
router.get("/articles/:id", articleController.show);

// Rotas Protegidas de Artigos (CRUD) - Exigem que o usuário esteja logado (authMiddleware)
router.post("/articles", authMiddleware, upload.single("bannerImage"), articleController.create);
router.put("/articles/:id", authMiddleware, upload.single("bannerImage"), articleController.update);
router.delete("/articles/:id", authMiddleware, articleController.delete);

export { router };
