import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";

import { registerSchemas, registerControllers } from "../libs/open-api";
import * as todoSchemas from "./schemas/todo";
import { todoController } from "./di";

const registry = new OpenAPIRegistry();

// !!!! Register schemas !!!!
registerSchemas(registry, [todoSchemas]);

// !!!! Register controllers !!!!
registerControllers(registry, todoController);

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
