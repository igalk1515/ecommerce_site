import dotenv from "dotenv";
import { buildApp } from "./app.js";

dotenv.config();

const app = await buildApp();
const port = Number(process.env.PORT || 4000);
app.listen({ port, host: "0.0.0.0" });
