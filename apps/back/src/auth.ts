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
          ca: `-----BEGIN CERTIFICATE-----
MIIEQTCCAqmgAwIBAgIUMTemQHcBzWNfHdt+3AD1EMYrx5swDQYJKoZIhvcNAQEM
BQAwOjE4MDYGA1UEAwwvM2ZiNmYwOGUtYjNiYi00ZTVmLThiMGMtNDk2ODM1MWEy
ZjE4IFByb2plY3QgQ0EwHhcNMjQwMTAyMTkwNjAyWhcNMzMxMjMwMTkwNjAyWjA6
MTgwNgYDVQQDDC8zZmI2ZjA4ZS1iM2JiLTRlNWYtOGIwYy00OTY4MzUxYTJmMTgg
UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAPbIE6pP
6XuNSdbBOG/RBdKClXT4jJra7NOmMl6oLz2EWm8eUlbtZ4IwSvYA66byGYyU2EXN
qAH1/q6KrM6rLHWHAlM8cNfYtqzMof3o1wWVUcf1O48S/g/ec5SM+30Rd0F5e9FN
b1HVPdAOXn2MVFcFyIS6t4tggn+HV6aV2+tWey6o7ENzO540xPcp4rh++yRxSRcQ
nKajVA0GrzDTom9g/M/pqomlhIgWcuAEbt84ZgKTPI7PfJJmd7xctKs5/K+ctmJr
BfAA5UwH19zDmd6KGxDIJi1GHmImHCtNb1/zkPv3Vp/iDC9WHyyyayrvzqqFTD+F
qbL4FxL8tU1pWMwAavMOdjgY8HBa3UEP1xlxXOmpK7Ax6BONlZT47cncKQsr8H6q
xXlDtLjokWi1wWwHMXIKc1qoRrG90kzmphD6yC5HEU1RWnPRPxtNYqndqF6Mci0r
HRDdf2m5ZuyhsqMwXhyHVi/iW4Q3LfLnWIP1uzj0rLu3uI/YK59bpVokbQIDAQAB
oz8wPTAdBgNVHQ4EFgQU/59KUUKPg4HslnDhQmiYw4GTtgEwDwYDVR0TBAgwBgEB
/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBACK6F6OX02/hKlI2
wpyarT1kpezAVCvxekKXhcPYJyoscCnc7bJN70zqj0f6DTHGFoK4I67/AZxkBcsz
cM17Q+0Sny3nDtqCLArUeF6YCN8zSEXqHi2N1iaw+lRWDvqlfqUr+aGzlLQdoXup
nrV66nch2+9ZhAxEHl1kHYb1dXWn2nQ7siv8ptsdasN4qhVg1R9k/l7tEHCIGwh6
DOnW9NyLaF5t1jeMC9ygWK7x0yGlFjX4dYQWYo84g8dkzlaAYO195HmF3WSqjy63
mtDxT2gdL71mlT+RuN+IG5nNXKwI4kH4rCUP897TesjuvKI++2bnC4Yd3YLbOQ5Y
vSOY953QIDc4/orQjRX16FnbHKU1vdiqMAAARLPZUtWTx0GmMUccTTySwrTMeg65
l+XRmTTtJI3bGqRTUQYViOz2AD0M87cdSszI0YBuW1kMFyojabLIZd0Syj9zb6eq
uenomTUoinum6vvdET6csZeFdLmCH8E+HIH6hpIQT6OO9Sabag==
-----END CERTIFICATE-----
`,
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
