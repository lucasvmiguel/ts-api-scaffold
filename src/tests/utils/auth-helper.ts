import request from "supertest";

import type { User } from "../../generated/prisma/client";
import type { Token } from "../../types/token";

export const createUser = async (
  app: any,
  defaultEmail?: string,
  defaultPassword?: string,
): Promise<{ user: User; token: Token }> => {
  const email = defaultEmail || `${Date.now()}@example.com`;
  const password = defaultPassword || "password123";

  const payload = {
    email,
    password,
    name: "Todo Tester",
  };

  let authRes = await request(app).post("/api/auth/register").send(payload);

  if (authRes.status !== 201) {
    throw new Error(
      `Failed to create user: ${authRes.status} ${JSON.stringify(authRes.body)}`,
    );
  }

  return authRes.body.data;
};
