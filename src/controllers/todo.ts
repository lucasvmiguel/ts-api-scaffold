import type { Request, Response } from "express";
import { z } from "zod";

import { TodoService } from "../services/todo";
import {
  createTodoSchema,
  updateTodoSchema,
  TodoSchema,
} from "../schemas/todo";
import { OpenApi, ApiTags } from "../../libs/open-api";

@ApiTags(["Todos"])
export class TodoController {
  constructor(private todoService: TodoService) {}

  @OpenApi({
    method: "get",
    path: "/todos",
    summary: "Retrieve a list of todos",
    responses: {
      200: {
        description: "A list of todos",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
              data: z.array(TodoSchema),
            }),
          },
        },
      },
    },
  })
  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const todos = await this.todoService.getAllTodos();
      res.json({ message: "Todos retrieved successfully", data: todos });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch todos", details: "Unknown error" });
    }
  };

  @OpenApi({
    method: "get",
    path: "/todos/{id}",
    summary: "Get a todo by ID",
    request: {
      params: z.object({ id: z.string().openapi({ example: "1" }) }),
    },
    responses: {
      200: {
        description: "The todo description",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
              data: TodoSchema,
            }),
          },
        },
      },
      404: {
        description: "Todo not found",
      },
    },
  })
  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid ID", details: null });
        return;
      }
      const todo = await this.todoService.getTodoById(id);
      if (!todo) {
        res.status(404).json({ message: "Todo not found", details: null });
        return;
      }
      res.json({ message: "Todo retrieved successfully", data: todo });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch todo", details: "Unknown error" });
    }
  };

  @OpenApi({
    method: "post",
    path: "/todos",
    summary: "Create a new todo",
    request: {
      body: {
        content: {
          "application/json": {
            schema: createTodoSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "The created todo",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
              data: TodoSchema,
            }),
          },
        },
      },
    },
  })
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = createTodoSchema.parse(req.body);
      const todo = await this.todoService.createTodo(data);
      res
        .status(201)
        .json({ message: "Todo created successfully", data: todo });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Validation error", details: error.issues });
      } else {
        res
          .status(500)
          .json({ message: "Failed to create todo", details: "Unknown error" });
      }
    }
  };

  @OpenApi({
    method: "put",
    path: "/todos/{id}",
    summary: "Update a todo",
    request: {
      params: z.object({ id: z.string().openapi({ example: "1" }) }),
      body: {
        content: {
          "application/json": {
            schema: updateTodoSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "The updated todo",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
              data: TodoSchema,
            }),
          },
        },
      },
      404: {
        description: "Todo not found",
      },
    },
  })
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid ID", details: null });
        return;
      }
      const data = updateTodoSchema.parse(req.body);
      const todo = await this.todoService.updateTodo(id, data);
      if (!todo) {
        res.status(404).json({ message: "Todo not found", details: null });
        return;
      }
      res.json({ message: "Todo updated successfully", data: todo });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Validation error", details: error.issues });
      } else {
        res
          .status(500)
          .json({ message: "Failed to update todo", details: "Unknown error" });
      }
    }
  };

  @OpenApi({
    method: "delete",
    path: "/todos/{id}",
    summary: "Delete a todo",
    request: {
      params: z.object({ id: z.string().openapi({ example: "1" }) }),
    },
    responses: {
      200: {
        description: "The deleted todo",
      },
    },
  })
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid ID", details: null });
        return;
      }
      const todo = await this.todoService.deleteTodo(id);
      if (!todo) {
        res.status(404).json({ message: "Todo not found", details: null });
        return;
      }
      res
        .status(200)
        .json({ message: "Todo deleted successfully", data: null });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to delete todo", details: "Unknown error" });
    }
  };
}
