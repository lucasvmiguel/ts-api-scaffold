# ts-api-scaffold

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run db:up
```

```bash
bun run db:migrate
```

```bash
bun run dev
```

For seed:

```bash
bun run db:seed
```

# Technologies

- [x] TypeScript
- [x] Express.js
- [x] Bun
- [x] Prisma (PostgreSQL)
- [x] Zod (Validation)
- [x] OpenAPI (Swagger)
- [x] Prisma
- [x] Docker
- [x] Github Actions

# Architecture

The service is RESTful API with the following layers:

- [Controller](src/controllers): handles http requests
- [Service](src/services): handles business logic
- [Repository](src/repository): handles data access
- [Models](src/generated/prisma/models): defines data structure
- [Routes](src/routes.ts): defines routes
- [Server](src/server.ts): defines server configuration
