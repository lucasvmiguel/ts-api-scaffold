# ts-api-scaffold

A robust, production-ready REST API scaffold built with modern tooling for speed and developer experience. Designed to be easily extensible for both human developers and AI agents ("Vibe Coding").

## 🚀 Tech Stack

- **Runtime:** [Bun](https://bun.sh) - Fast all-in-one JavaScript runtime.
- **Framework:** [Express.js](https://expressjs.com/) - Minimalist web framework.
- **Language:** [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript.
- **Database:** [PostgreSQL](https://www.postgresql.org/) - Advanced open-source relational database.
- **ORM:** [Prisma](https://www.prisma.io/) - Next-generation Node.js and TypeScript ORM.
- **Validation:** [Zod](https://zod.dev/) - TypeScript-first schema declaration and validation library.
- **Documentation:** [OpenAPI (Swagger)](https://swagger.io/specification/) - Standard for defining RESTful interfaces, with UI via `swagger-ui-express`.
- **Testing:** `bun:test` & `supertest` - Native Bun test runner and HTTP assertions.
- **Infrastructure:** Docker & Docker Compose - Containerization for database and services.
- **CI/CD:** GitHub Actions - Automated testing and checks.

---

## 🏗️ Architecture

The application follows a clean **Controller-Service-Repository** layered architecture to ensure separation of concerns and testability.

1.  **Controller Layer** (`src/controllers`): Handles HTTP requests, validation (via Zod), and sends responses. It does _not_ contain business logic.
2.  **Service Layer** (`src/services`): Contains the core business logic. It orchestrates data flow and interacts with repositories.
3.  **Repository Layer** (`src/repositories`): Handles all direct database interactions using Prisma.
4.  **Dependency Injection** (`src/di.ts`): Dependencies are manually injected to keep the architecture simple and testable without heavy frameworks.

---

## ⚡ Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed.
- [Docker](https://www.docker.com/) installed (for the database).

### Installation

1.  Install dependencies:

    ```bash
    bun install
    ```

2.  Start the database container:

    ```bash
    bun run db:up
    ```

3.  Apply database migrations:

    ```bash
    bun run db:migrate <migration_name>
    # or for development without creating a new migration file:
    bun x prisma db push
    ```

4.  Seed the database (optional):

    ```bash
    bun run db:seed
    ```

5.  Run the development server:
    ```bash
    bun run dev
    ```

The API will be available at `http://localhost:3000/api`.
Swagger documentation is available at `http://localhost:3000/api/docs`.

### Testing

Run integration tests using the native Bun test runner:

```bash
bun test
```

---

## 🤖 Vibe Coding / AI Context

**This section is explicitly written for AI agents and LLMs to understand the coding style and conventions of this project.**

### Coding Standards

- **Runtime**: Use `bun` for all scripts and execution.
- **Imports**: Use explicit file extensions (e.g., `import { foo } from "./bar.ts"` or `./bar`) if required by configuration, but standard Node-style resolution is supported by Bun.
- **Dependency Injection**: Use manual dependency injection in `src/di.ts`. Do not use IoC containers like InversifyJS unless necessary.
  - Example: `const todoController = new TodoController(todoService);`
- **Environment Variables**: Access via `process.env`. Ensure strict typing where possible.

### Architectural Patterns

#### 1. Controllers (`src/controllers/*.ts`)

- **Classes**: logic is encapsulated in classes.
- **Decorators**: Use `@OpenApi` (from `../../libs/open-api`) to define swagger documentation directly on the methods.
  - Define `method`, `path`, `summary`, `request` (body/params), and `responses`.
- **Methods**: All controller methods should be `async` and return `Promise<void>`.
- **Response**: Use `res.json()` with a standard envelope:
  - Success: `{ message: string, data: any }`
  - Error: `{ message: string, details: any }`
- **Error Handling**: Wrap logic in `try/catch`. Handle `z.ZodError` explicitly (400 Bad Request). Catch-all 500 for unknown errors.
- **File naming**: Use for files (e.g., `some-entity.ts`).

#### 2. Services (`src/services/*.ts`)

- **Business Logic**: All complex logic resides here.
- **Return Values**: Return domain objects or `null` if not found. Do not throw HTTP errors here; let the controller handle status codes based on the return value.
- **File naming**: Use for files (e.g., `some-entity.ts`).

#### 3. Repositories (`src/repositories/*.ts`)

- **Prisma Access**: This is the only layer that should import `prisma` client directly.
- **Methods**: `findAll`, `findById`, `create`, `update`, `delete`.
- **Error Handling**:
  - Catch `P2025` (Record to update not found) and return `null` or `false` rather than throwing, if appropriate for the flow.
- **File naming**: Use for files (e.g., `some-entity.ts`).

#### 4. Validation (`src/schemas/*.ts`)

- **Zod**: Define strict Zod schemas for all request bodies and route parameters.
- **Naming**: suffix with `Schema` (e.g., `createTodoSchema`, `updateTodoSchema`).
- **OpenAPI Integration**: Use `@asteasolutions/zod-to-openapi` (via `.openapi()` method on Zod schemas) to provide examples and descriptions for Swagger.
- **File naming**: Use for files (e.g., `some-entity.ts`).

#### 5. Testing (`src/tests`)

- **Type**: Integration tests are preferred over extensive unit mocking for this scaffold.
- **Tooling**: Use `bun:test` (`describe`, `it`, `expect`) and `supertest` (`request`).
- **DB Helper**: Use `dbHelper` from `src/tests/utils/db-helper.ts` to managing the test database lifecycle (Docker container).
  - `beforeAll`: `await dbHelper.start()`
  - `afterAll`: `await dbHelper.stop()`
- **Structure**: Group tests by functionality (`describe("GET /api/resource")`).
- **File naming**: Use for files (e.g., `some-entity.test.ts`).

### Key Files to Reference

- `src/server.ts`: App entry point, middleware setup.
- `src/routes.ts`: Main router file.
- `src/di.ts`: Dependency wiring.
- `src/libs/open-api.ts`: Custom decorator logic for Swagger.

---
