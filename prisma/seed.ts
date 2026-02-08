import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  // Create multiple users
  await prisma.todo.createMany({
    data: [
      { title: "Task 1", description: "Description 1", done: true },
      { title: "Task 2", description: "Description 2", done: false },
      { title: "Task 3", description: "Description 3", done: true },
      { title: "Task 4", description: "Description 4", done: false },
    ],
    skipDuplicates: true, // prevents errors if you run the seed multiple times
  });

  console.log("Seed data inserted!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
