import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Database, DatabaseLive } from "../drizzle";
import { Effect, pipe } from "effect";
import { DotEnvConfigProviderLayer } from "../effect/env.server";

// TODO: add google and remove email
const createBetterAuth = (database: Database) =>
  betterAuth({
    database: drizzleAdapter(database, { provider: "pg" }),
    emailAndPassword: { enabled: true },
  });

export const auth = await pipe(
  Database,
  Effect.map(createBetterAuth),
  Effect.provide(DatabaseLive),
  Effect.provide(DotEnvConfigProviderLayer),
  Effect.runPromise,
);
