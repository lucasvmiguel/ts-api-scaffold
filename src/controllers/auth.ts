import type { Request, Response } from "express";
import { z } from "zod";

import { AuthService } from "../services/auth";
import {
  loginSchema,
  tokenSchema,
  registerSchema,
  refreshSchema,
  AuthSchema,
  UserSchema,
} from "../schemas/auth";
import { OpenApi, ApiTags } from "../../libs/open-api";

@ApiTags(["Auth"])
export class AuthController {
  constructor(private authService: AuthService) {}

  @OpenApi({
    method: "post",
    path: "/auth/register",
    summary: "Register a new user",
    request: {
      body: { content: { "application/json": { schema: registerSchema } } },
    },
    responses: {
      201: {
        description: "User registered successfully",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
              data: z.object({
                user: UserSchema,
                token: AuthSchema,
              }),
            }),
          },
        },
      },
      400: { description: "Bad request" },
    },
  })
  async register(req: Request, res: Response) {
    try {
      const data = registerSchema.parse(req.body);
      const { user, token } = await this.authService.register(data);

      res.status(201).json({
        message: "User registered successfully",
        data: {
          user,
          token,
        },
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  @OpenApi({
    method: "post",
    path: "/auth/login",
    summary: "Login user",
    request: {
      body: { content: { "application/json": { schema: loginSchema } } },
    },
    responses: {
      200: {
        description: "Login successful",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
              data: z.object({
                user: UserSchema,
                token: AuthSchema,
              }),
            }),
          },
        },
      },
      401: { description: "Invalid credentials" },
    },
  })
  async login(req: Request, res: Response) {
    try {
      const data = loginSchema.parse(req.body);
      const { user, token } = await this.authService.login(data);
      res.status(200).json({
        message: "Login successful",
        data: {
          user,
          token,
        },
      });
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  }

  @OpenApi({
    method: "post",
    path: "/auth/refresh",
    summary: "Refresh access token",
    request: {
      body: { content: { "application/json": { schema: refreshSchema } } },
    },
    responses: {
      200: {
        description: "Token refreshed successfully",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
              data: AuthSchema,
            }),
          },
        },
      },
      401: { description: "Invalid refresh token" },
    },
  })
  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = refreshSchema.parse(req.body);
      const tokens = await this.authService.refresh(refreshToken);
      res
        .status(200)
        .json({ message: "Token refreshed successfully", data: tokens });
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  }

  @OpenApi({
    method: "post",
    path: "/auth/logout",
    summary: "Logout user",
    request: {
      body: { content: { "application/json": { schema: tokenSchema } } },
    },
    responses: {
      200: {
        description: "Logout successful",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
      },
    },
  })
  async logout(req: Request, res: Response) {
    try {
      const { accessToken } = tokenSchema.parse(req.body);
      await this.authService.logout(accessToken);
      res.status(200).json({ message: "Logout successful" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
