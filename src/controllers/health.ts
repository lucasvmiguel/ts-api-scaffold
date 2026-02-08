import type { Request, Response } from "express";

export class HealthController {
  get = async (_: Request, res: Response): Promise<void> => {
    res.json({ message: "Up and running" });
  };
}
