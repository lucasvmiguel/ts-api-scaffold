import { z } from "zod";

import type { Todo } from "../generated/prisma/client";
import { createTodoSchema, updateTodoSchema } from "../schemas/todo";
import { TodoRepository } from "../repositories/todo";

type CreateTodoInput = z.infer<typeof createTodoSchema>;
type UpdateTodoInput = z.infer<typeof updateTodoSchema>;

export class TodoService {
  constructor(private todoRepository: TodoRepository) {}

  async getAllTodos(): Promise<Todo[]> {
    return this.todoRepository.findAll();
  }

  async getTodoById(id: number): Promise<Todo | null> {
    return this.todoRepository.findById(id);
  }

  async createTodo(data: CreateTodoInput): Promise<Todo> {
    return this.todoRepository.create(data);
  }

  async updateTodo(id: number, data: UpdateTodoInput): Promise<Todo | null> {
    return this.todoRepository.update(id, data);
  }

  async deleteTodo(id: number): Promise<Todo | null> {
    return this.todoRepository.delete(id);
  }
}
