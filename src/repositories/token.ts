import type { Token } from "../generated/prisma/client";
import { Prisma } from "../generated/prisma/client";
import prisma from "../db";

export class TokenRepository {
  async create(data: Prisma.TokenCreateInput): Promise<Token> {
    return prisma.token.create({
      data,
    });
  }

  async findByToken(token: string): Promise<Token | null> {
    return prisma.token.findUnique({
      where: { token },
    });
  }

  async revoke(id: number): Promise<Token> {
    return prisma.token.update({
      where: { id },
      data: { revoked: true },
    });
  }
}
