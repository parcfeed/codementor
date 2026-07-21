const env = {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? "",
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  NODE_ENV: process.env.NODE_ENV ?? "development",
} as const;

export function validateEnv(): void {
  const missing: string[] = [];

  if (!env.NEXTAUTH_SECRET) missing.push("NEXTAUTH_SECRET");
  if (!env.DATABASE_URL) missing.push("DATABASE_URL");

  if (missing.length > 0) {
    throw new Error(
      `Variables d'environnement manquantes: ${missing.join(", ")}`,
    );
  }
}

export default env;
