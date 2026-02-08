import { execSync } from "child_process";

export class TestDatabase {
  private containerId: string | undefined;
  private databaseUrl: string | undefined;

  async start(): Promise<string> {
    // Only use existing DATABASE_URL if in CI
    if (process.env.DATABASE_URL && process.env.CI === "true") {
      console.log(`Using existing DATABASE_URL: ${process.env.DATABASE_URL}`);
      this.databaseUrl = process.env.DATABASE_URL;

      console.log("Applying migrations...");
      execSync("bunx --bun prisma migrate deploy", {
        env: { ...process.env, DATABASE_URL: this.databaseUrl },
        stdio: "inherit",
      });
      console.log("Migrations applied successfully.");

      return this.databaseUrl;
    }

    console.log("Starting Postgres container manually...");
    try {
      // Use -P to publish all exposed ports to random ports
      // Use -d for detached
      // Use --rm to remove on stop
      const cmd =
        "docker run -d --rm -P -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=testdb postgres:16-alpine";
      this.containerId = execSync(cmd).toString().trim();
      console.log(`Container ID: ${this.containerId}`);

      // Get the mapped port
      let portMapping = "";
      for (let i = 0; i < 10; i++) {
        try {
          portMapping = execSync(`docker port ${this.containerId} 5432/tcp`)
            .toString()
            .trim();
          if (portMapping) break;
        } catch (e) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }

      if (!portMapping) {
        throw new Error("Could not get port mapping");
      }

      console.log(`Port mapping: ${portMapping}`);
      // output format usually: 0.0.0.0:32768
      const parts = portMapping.split(":");
      const hostPort = parts[parts.length - 1];

      this.databaseUrl = `postgresql://postgres:postgres@localhost:${hostPort}/testdb?schema=public`;
      process.env.DATABASE_URL = this.databaseUrl;

      console.log(`Database URL: ${this.databaseUrl}`);

      // Wait for DB to be ready.
      // Simple 5s sleep to let Postgres start up.
      await new Promise((r) => setTimeout(r, 5000));

      console.log("Applying migrations...");
      execSync("bunx --bun prisma migrate deploy", {
        env: { ...process.env, DATABASE_URL: this.databaseUrl },
        stdio: "inherit",
      });
      console.log("Migrations applied successfully.");

      return this.databaseUrl;
    } catch (e) {
      console.error("Setup failed:", e);
      if (this.containerId) {
        execSync(`docker stop ${this.containerId}`);
      }
      throw e;
    }
  }

  async stop(): Promise<void> {
    if (this.containerId) {
      try {
        console.log(`Stopping container ${this.containerId}...`);
        execSync(`docker stop ${this.containerId}`);
        console.log("Container stopped.");
      } catch (e) {
        console.error("Failed to stop container:", e);
      }
    }
  }

  getDatabaseUrl(): string | undefined {
    return this.databaseUrl;
  }
}

export const dbHelper = new TestDatabase();
