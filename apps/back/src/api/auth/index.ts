import { type FastifyInstance } from "fastify";
import { auth } from "../../auth.js";

export async function registerAuthRoutes(fastify: FastifyInstance) {
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
}
