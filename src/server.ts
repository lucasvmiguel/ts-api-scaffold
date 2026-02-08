import express from "express";
import swaggerUi from "swagger-ui-express";

import router from "./routes";
import { specs } from "./swagger";
import { logger } from "./middlewares/logger";

const app = express();

app.use(logger);
app.use(express.json());
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use("/api", router);

export default app;
