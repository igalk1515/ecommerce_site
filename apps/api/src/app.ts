import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import { registerRoutes } from "./routes/index.js";

export async function buildApp() {
  const app = Fastify({ logger: false });
  await app.register(cors, { origin: true, credentials: true });
  await app.register(cookie);
  await app.register(jwt, { secret: process.env.JWT_SECRET || "dev-secret" });
  await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });
  await registerRoutes(app);
  return app;
}
