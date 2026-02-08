import { beforeAll, afterAll } from "bun:test";

import { dbHelper } from "../utils/db-helper";

beforeAll(async () => {
  await dbHelper.start();
}, 120000);

afterAll(async () => {
  await dbHelper.stop();
});
