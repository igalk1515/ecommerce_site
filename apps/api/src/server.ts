import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildApp } from "./app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const app = await buildApp();
const port = Number(process.env.PORT || 4000);
app.listen({ port, host: "0.0.0.0" });
