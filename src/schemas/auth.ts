import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const registerSchema = z.object({
  email: z.string().email().openapi({ example: "user@example.com" }),
  password: z.string().min(6).openapi({ example: "password123" }),
  name: z.string().optional().openapi({ example: "John Doe" }),
});

export const loginSchema = z.object({
  email: z.string().email().openapi({ example: "user@example.com" }),
  password: z.string().openapi({ example: "password123" }),
});

export const tokenSchema = z.object({
  accessToken: z
    .string()
    .openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }),
});

export const refreshSchema = z.object({
  refreshToken: z
    .string()
    .openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }),
});

export const AuthSchema = z.object({
  accessToken: z
    .string()
    .openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }),
  refreshToken: z
    .string()
    .openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }),
});

export const UserSchema = z.object({
  id: z.string().openapi({ example: "1" }),
  email: z.string().email().openapi({ example: "user@example.com" }),
  name: z.string().openapi({ example: "John Doe" }),
});
