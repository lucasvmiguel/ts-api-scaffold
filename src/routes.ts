import { Router } from "express";

import { todoController, healthController } from "./di";

const router = Router();

// Health check
router.get("/health", healthController.get);

// Todo routes
router.get("/todos", todoController.getAll);
router.get("/todos/:id", todoController.getById);
router.post("/todos", todoController.create);
router.put("/todos/:id", todoController.update);
router.delete("/todos/:id", todoController.delete);

export default router;
