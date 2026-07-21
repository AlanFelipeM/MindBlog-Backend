import { Router } from "express";
import { UserController } from "./controllers/UserController.js";

const router = Router();
const userController = new UserController();

// User Routes
router.post("/users/register", userController.register);
router.post("/users/login", userController.login);

export { router };
