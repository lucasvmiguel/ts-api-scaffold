import prisma from "../db";
import type { Todo, Prisma } from "../generated/prisma/client";

export class TodoRepository {
  async findAll(): Promise<Todo[]> {
    return prisma.todo.findMany();
  }

  async findById(id: number): Promise<Todo | null> {
    return prisma.todo.findUnique({ where: { id } });
  }

  async create(data: Prisma.TodoCreateInput): Promise<Todo> {
    return prisma.todo.create({ data });
  }

  async update(id: number, data: Prisma.TodoUpdateInput): Promise<Todo | null> {
    try {
      return await prisma.todo.update({ where: { id }, data });
    } catch (error) {
      if ((error as Prisma.PrismaClientKnownRequestError).code === "P2025") {
        return null;
      }
      throw error;
    }
  }

  async delete(id: number): Promise<Todo | null> {
    try {
      return await prisma.todo.delete({ where: { id } });
    } catch (error) {
      if ((error as Prisma.PrismaClientKnownRequestError).code === "P2025") {
        return null;
      }
      throw error;
    }
  }
}
