import { createRequire } from "node:module";
import "dotenv/config";
import fastifyCors from "@fastify/cors";
import Fastify, { type FastifyServerOptions } from "fastify";
import { registerAuthRoutes } from "./api/auth/index.js";
import fastifyStatic from "@fastify/static";
import path from "node:path";

const PORT = parseInt(process.env.PORT || "4000", 10);
const HOST = process.env.HOST || "0.0.0.0";
const require = createRequire(import.meta.url);

const logger: Record<string, unknown> = {
  level: process.env.LOG_LEVEL || "info",
};

if (process.env.NODE_ENV === "development") {
  try {
    const pinoPrettyPath = require.resolve("pino-pretty");
    logger.transport = {
      target: pinoPrettyPath,
      options: {
        colorize: true,
      },
    };
  } catch (error) {
    console.warn(
      "pino-pretty is not available; developer-friendly logging is disabled.",
      error,
    );
  }
}

const fastify = Fastify({
  logger: logger as FastifyServerOptions["logger"],
});

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || "http://localhost:8081", // Mobile/React Native
  "http://localhost:4200", // Angular dev server
  "http://127.0.0.1:4200", // Angular dev server (localhost variant)
  "http://localhost", // Capacitor WebView
  "capacitor://localhost", // Capacitor scheme
];

// Add deployed frontend URL if in production
if (process.env.NODE_ENV === "production" && process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

await fastify.register(fastifyCors, {
  origin: allowedOrigins.filter(Boolean),
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true, // Required for cookies
  maxAge: 86400,
});

// Health check endpoint
fastify.get("/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// Register auth routes
await registerAuthRoutes(fastify);

fastify.register(fastifyStatic, {
  root: path.join(__dirname, "../public/browser"),
  prefix: "/",
});

fastify.setNotFoundHandler((req, reply) => {
  reply.sendFile("index.html");
});

// Start server
try {
  await fastify.listen({ port: PORT, host: HOST });
  console.log(`🚀 Backend server running at http://${HOST}:${PORT}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
