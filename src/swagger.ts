import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";

import { registerSchemas, registerControllers } from "../libs/open-api";

import * as todoSchemas from "./schemas/todo";
import * as authSchemas from "./schemas/auth";
import { todoController, authController } from "./di";

const registry = new OpenAPIRegistry();

// !!!! Register schemas !!!!
registerSchemas(registry, [todoSchemas, authSchemas]);

// !!!! Register controllers !!!!
registerControllers(registry, [todoController, authController]);

const generator = new OpenApiGeneratorV3(registry.definitions);

export const specs = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "TS API Scaffold",
    version: "1.0.0",
    description: "A simple Express API with TypeScript",
  },
  servers: [{ url: "/api" }],
});
