import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET environment variable is required");
}

if (!process.env.BETTER_AUTH_URL) {
  throw new Error("BETTER_AUTH_URL environment variable is required");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: true,
          ca: process.env.DATABASE_SSL_CA
            ? process.env.DATABASE_SSL_CA.split("\\n").join("\n")
            : undefined,
        }
      : false,
});

const isProduction = process.env.NODE_ENV === "production";
const port = parseInt(process.env.PORT || "4000", 10);
const host = process.env.HOST || "0.0.0.0";

// Generate server origins for all ways it can be accessed
const serverOrigins =
  host === "0.0.0.0"
    ? [`http://localhost:${port}`, `http://127.0.0.1:${port}`]
    : [`http://${host}:${port}`];

export const auth = betterAuth({
  database: pool,
  plugins: [bearer()], // Enable Bearer token authentication for mobile/Capacitor apps
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Disabled as per requirements
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      enabled: !!(
        process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ),
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!(
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ),
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID || "",
      clientSecret: process.env.APPLE_CLIENT_SECRET || "",
      enabled: !!(
        process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET
      ),
    },
  },
  trustedOrigins: [
    ...serverOrigins, // Current server origins (for served frontend)
    "http://localhost:8081", // Expo dev server
    "http://localhost:4200", // Angular dev server
    "http://127.0.0.1:4200", // Angular dev server (localhost variant)
    process.env.CLIENT_ORIGIN || "",
  ].filter(Boolean),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  advanced: {
    useSecureCookies: isProduction,
    defaultCookieAttributes: {
      httpOnly: true, // Keep httpOnly true for security on web (can't be accessed by JS)
      secure: isProduction,
      sameSite: "lax",
      path: "/",
    },
    disableCSRFCheck: false,
  },
});
