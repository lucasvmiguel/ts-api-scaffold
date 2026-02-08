import type { Request, Response, NextFunction } from "express";

/**
 * Middleware to log request information including method, endpoint, and user ID.
 * Logs are produced after the request is finished to ensure user information (if any) is available.
 */
export const logger = (req: Request, res: Response, next: NextFunction) => {
  const { method, originalUrl } = req;
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const userId = (req as any).user?.userId || "anonymous";
    const record = `[${new Date().toISOString()}] ${method} ${originalUrl} - User: ${userId} - Status: ${res.statusCode} - ${duration}ms`;

    console.log(record);
  });

  next();
};
