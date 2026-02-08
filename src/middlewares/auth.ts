import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import type { DecodedToken } from "../types/token";

const JWT_SECRET = process.env.JWT_SECRET!;

export type MiddlewareUser = {
  id: number;
  email: string;
};

export interface AuthRequest extends Request {
  user?: MiddlewareUser;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as DecodedToken;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
    } as MiddlewareUser;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }
};
