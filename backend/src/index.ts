import express from "express";
import cors from "cors";
import { apiRouter } from "./routes/auth.js";
import { todoRouter } from "./routes/todo.js";
import { authMiddleware } from "./middleware/auth.js";
import { loadEnv } from "./config/env.js";
import { logger } from "./logger.js";
import { closePrisma } from "./db/postgres.js";

const env = loadEnv();

const app = express();

// CORS for frontend
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", apiRouter);
app.use("/api/todos", authMiddleware, todoRouter);

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "server listening");
});

// Graceful shutdown
async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, "Shutting down");
  server.close();
  await closePrisma();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
