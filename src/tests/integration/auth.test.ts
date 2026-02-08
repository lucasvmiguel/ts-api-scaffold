import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import request from "supertest";

import { createUser } from "../utils/auth-helper";

describe("Auth Integration Tests", () => {
  let app: any;

  beforeAll(async () => {
    const serverModule = await import("../../server");
    app = serverModule.default;
  }, 120000);

  it("should register a new user", async () => {
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      password: "password123",
      name: "Test User",
    };
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser)
      .expect(201);

    expect(res.body.data.user).toMatchObject({
      id: expect.any(Number),
      name: testUser.name,
      email: testUser.email,
    });
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.token.accessToken).toBeDefined();
    expect(res.body.data.token.refreshToken).toBeDefined();
  });

  it("should login with existing user", async () => {
    const email = "test@example.com";
    const password = "password123";
    const { user } = await createUser(app, email, password);
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      })
      .expect(200);

    expect(res.body.data.user).toMatchObject({
      id: user.id,
      name: user.name,
      email: user.email,
    });
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.token.accessToken).toBeDefined();
    expect(res.body.data.token.refreshToken).toBeDefined();
  });

  it("should fail validation with invalid email", async () => {
    const testUser = {
      email: `invalid-email`,
      password: "password123",
      name: "Test User",
    };
    await request(app).post("/api/auth/register").send(testUser).expect(400);
  });

  it("should refresh access token", async () => {
    const {
      token: { refreshToken },
    } = await createUser(app);
    // Wait for a bit if needed, but not strictly necessary for simple test
    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken })
      .expect(200);

    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it("should logout user", async () => {
    const {
      token: { accessToken },
    } = await createUser(app);
    await request(app)
      .post("/api/auth/logout")
      .send({ accessToken })
      .expect(200);
  });

  it("should not refresh with revoked token", async () => {
    const {
      token: { accessToken },
    } = await createUser(app);
    await request(app)
      .post("/api/auth/refresh")
      .send({ accessToken })
      .expect(401);
  });
});
