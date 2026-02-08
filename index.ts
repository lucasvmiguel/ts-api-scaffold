import "reflect-metadata";
import app from "./src/server";

const port = process.env.SERVER_PORT;

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
