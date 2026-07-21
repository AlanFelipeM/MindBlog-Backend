import { Router } from "express";
import multer from "multer";
import { UserController } from "./controllers/UserController.js";
import { ArticleController } from "./controllers/ArticleController.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";

const router = Router();
const userController = new UserController();
const articleController = new ArticleController();

// Configure multer to store files in memory as Buffers (for BLOBs)
const upload = multer({ storage: multer.memoryStorage() });

// User Routes
router.post("/users/register", userController.register);
router.post("/users/login", userController.login);

// Public Article Route (Listing)
router.get("/articles", articleController.index);

// Protected Article Routes (CRUD)
router.post("/articles", authMiddleware, upload.single("bannerImage"), articleController.create);
router.put("/articles/:id", authMiddleware, upload.single("bannerImage"), articleController.update);
router.delete("/articles/:id", authMiddleware, articleController.delete);

export { router };
