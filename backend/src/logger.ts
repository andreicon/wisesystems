import pino from "pino";
import { loadEnv } from "./config/env.js";

function createLogger(): pino.Logger {
  let env: { LOG_LEVEL: string; NODE_ENV: string };
  try {
    env = loadEnv();
  } catch {
    env = { LOG_LEVEL: "info", NODE_ENV: "development" };
  }

  return pino({
    level: env.LOG_LEVEL,
    ...(env.NODE_ENV === "development" && {
      transport: {
        target: "pino-pretty",
        options: { colorize: true },
      },
    }),
  });
}

export const logger = createLogger();
