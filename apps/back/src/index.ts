import { createRequire } from "node:module";
import "dotenv/config";
import fastifyCors from "@fastify/cors";
import Fastify, { type FastifyServerOptions } from "fastify";
import { auth } from "./auth.js";

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
await fastify.register(fastifyCors, {
	origin: process.env.CLIENT_ORIGIN || "http://localhost:8081",
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
	credentials: true,
	maxAge: 86400,
});

// Health check endpoint
fastify.get("/health", async () => {
	return { status: "ok", timestamp: new Date().toISOString() };
});

// Better Auth endpoint
fastify.route({
	method: ["GET", "POST"],
	url: "/api/auth/*",
	async handler(request, reply) {
		try {
			// Convert Fastify request to Fetch API Request
			const url = new URL(request.url, `http://${request.headers.host}`);
			const headers = new Headers();

			Object.entries(request.headers).forEach(([key, value]) => {
				if (value) {
					const headerValue = Array.isArray(value) ? value.join(", ") : value;
					headers.append(key, headerValue);
				}
			});

			const req = new Request(url.toString(), {
				method: request.method,
				headers,
				body:
					request.method !== "GET" && request.body
						? JSON.stringify(request.body)
						: undefined,
			});

			// Process authentication request
			const response = await auth.handler(req);

			// Forward response status and headers
			reply.status(response.status);
			response.headers.forEach((value, key) => {
				reply.header(key, value);
			});

			// Forward response body
			const body = await response.text();
			return body ? reply.send(body) : reply.send();
		} catch (error) {
			fastify.log.error(error, "Error handling auth request");
			reply.status(500).send({ error: "Internal server error" });
		}
	},
});

// Start server
try {
	await fastify.listen({ port: PORT, host: HOST });
	console.log(`🚀 Backend server running at http://${HOST}:${PORT}`);
	console.log(`📝 Auth endpoints available at http://${HOST}:${PORT}/api/auth/*`);
} catch (err) {
	fastify.log.error(err);
	process.exit(1);
}
