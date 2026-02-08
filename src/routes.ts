import { Router } from "express";

import { todoController, healthController, authController } from "./di";
import { authenticate } from "./middlewares/auth";

const router = Router();

// Health check
router.get("/health", healthController.get);

// Auth routes
router.post("/auth/register", authController.register.bind(authController));
router.post("/auth/login", authController.login.bind(authController));
router.post("/auth/refresh", authController.refresh.bind(authController));
router.post("/auth/logout", authController.logout.bind(authController));

// Todo routes
router.get("/todos", authenticate, todoController.getAll);
router.get("/todos/:id", authenticate, todoController.getById);
router.post("/todos", authenticate, todoController.create);
router.put("/todos/:id", authenticate, todoController.update);
router.delete("/todos/:id", authenticate, todoController.delete);

export default router;
