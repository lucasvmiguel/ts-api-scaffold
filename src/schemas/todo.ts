import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const TodoSchema = z
  .object({
    id: z.number().openapi({ example: 1 }),
    title: z.string().openapi({ example: "Buy milk" }),
    description: z.string().nullable().openapi({ example: "2% fat" }),
    done: z.boolean().openapi({ example: false }),
  })
  .openapi("Todo");

export const createTodoSchema = z
  .object({
    title: z.string().min(1).openapi({ example: "Buy milk" }),
    description: z.string().optional().openapi({ example: "2% fat" }),
  })
  .openapi("CreateTodo");

export const updateTodoSchema = z
  .object({
    title: z.string().min(1).optional().openapi({ example: "Buy milk" }),
    description: z.string().optional().openapi({ example: "2% fat" }),
    done: z.boolean().optional().openapi({ example: true }),
  })
  .openapi("UpdateTodo");
