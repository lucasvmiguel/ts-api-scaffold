import { describe, it, beforeAll, afterAll, expect } from "bun:test";
import request from "supertest";

import { createUser } from "../utils/auth-helper";
import { dbHelper } from "../utils/db-helper";

describe("Todo Integration Tests", () => {
  let app: any;
  let accessToken: string;

  beforeAll(async () => {
    // Start Postgres manually using db helper
    await dbHelper.start();

    console.log("Importing app...");
    // Adjust import path to point to src/server.ts from src/tests/integration/todo.test.ts
    const serverModule = await import("../../server");
    app = serverModule.default;
    console.log("App imported.");

    // Get access token
    const { token } = await createUser(app);
    accessToken = token.accessToken;
  }, 120000);

  afterAll(async () => {
    await dbHelper.stop();
  });

  describe("POST /api/todos", () => {
    it("should create a new todo", async () => {
      const todoData = {
        title: "Integration Test Todo",
        description: "Testing with Docker",
      };

      const response = await request(app)
        .post("/api/todos")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(todoData)
        .expect(201);

      expect(response.body.message).toBe("Todo created successfully");
      expect(response.body.data.title).toBe(todoData.title);
      expect(response.body.data.description).toBe(todoData.description);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.done).toBe(false);
    });

    it("should return 400 when creating a todo without title", async () => {
      const response = await request(app)
        .post("/api/todos")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ description: "Missing title" })
        .expect(400);

      expect(response.body.message).toBe("Validation error");
      expect(response.body.details).toBeDefined();
    });
  });

  describe("GET /api/todos", () => {
    it("should retrieve todos", async () => {
      const response = await request(app)
        .get("/api/todos")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.message).toBe("Todos retrieved successfully");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      const todo = response.body.data.find(
        (t: any) => t.title === "Integration Test Todo",
      );
      expect(todo).toBeDefined();
    });
  });

  describe("GET /api/todos/:id", () => {
    it("should get a todo by id", async () => {
      const createRes = await request(app)
        .post("/api/todos")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ title: "Todo for Get ID" });
      const id = createRes.body.data.id;

      const res = await request(app)
        .get(`/api/todos/${id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);
      expect(res.body.message).toBe("Todo retrieved successfully");
      expect(res.body.data.title).toBe("Todo for Get ID");
    });

    it("should return 404 when getting a non-existent todo", async () => {
      const nonExistentId = 999999;
      const res = await request(app)
        .get(`/api/todos/${nonExistentId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(404);
      expect(res.body.message).toBe("Todo not found");
      expect(res.body.details).toBeNull();
    });

    it("should return 400 when getting a todo with invalid ID", async () => {
      const res = await request(app)
        .get("/api/todos/invalid-id")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(400);
      expect(res.body.message).toBe("Invalid ID");
      expect(res.body.details).toBeNull();
    });
  });

  describe("PUT /api/todos/:id", () => {
    it("should update a todo", async () => {
      const createRes = await request(app)
        .post("/api/todos")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ title: "Todo to Update" });
      const id = createRes.body.data.id;

      const updateRes = await request(app)
        .put(`/api/todos/${id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ done: true })
        .expect(200);

      expect(updateRes.body.message).toBe("Todo updated successfully");
      expect(updateRes.body.data.done).toBe(true);

      const getRes = await request(app)
        .get(`/api/todos/${id}`)
        .set("Authorization", `Bearer ${accessToken}`);
      expect(getRes.body.data.done).toBe(true);
    });

    it("should return 404 when updating a non-existent todo", async () => {
      const nonExistentId = 999999;
      const res = await request(app)
        .put(`/api/todos/${nonExistentId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ title: "Updated Title" })
        .expect(404);
      expect(res.body.message).toBe("Todo not found");
      expect(res.body.details).toBeNull();
    });

    it("should return 400 when updating a todo with invalid ID", async () => {
      const res = await request(app)
        .put("/api/todos/invalid-id")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ title: "Updated Title" })
        .expect(400);
      expect(res.body.message).toBe("Invalid ID");
      expect(res.body.details).toBeNull();
    });
  });

  describe("DELETE /api/todos/:id", () => {
    it("should delete a todo", async () => {
      const createRes = await request(app)
        .post("/api/todos")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ title: "Todo to Delete" });
      const id = createRes.body.data.id;

      const deleteRes = await request(app)
        .delete(`/api/todos/${id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(deleteRes.body.message).toBe("Todo deleted successfully");
      expect(deleteRes.body.data).toBeNull();

      const getRes = await request(app)
        .get(`/api/todos/${id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(404);
      expect(getRes.body.message).toBe("Todo not found");
    });

    it("should return 404 when deleting a non-existent todo", async () => {
      const nonExistentId = 999999;
      const res = await request(app)
        .delete(`/api/todos/${nonExistentId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(404);
      expect(res.body.message).toBe("Todo not found");
    });

    it("should return 400 when deleting a todo with invalid ID", async () => {
      const res = await request(app)
        .delete("/api/todos/invalid-id")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(400);
      expect(res.body.message).toBe("Invalid ID");
    });
  });
});
