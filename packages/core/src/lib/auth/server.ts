import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Effect } from "effect";
import { Database } from "../drizzle";
// import * as schema from "../drizzle/schema";

export const Auth = Effect.gen(function* () {
  const database = yield* Database;

  const betterAuthInstance = betterAuth({
    // TODO: fix to be contextual on env
    trustedOrigins: ["http://localhost:3000"],
    emailAndPassword: { enabled: true },
    database: drizzleAdapter(database, { provider: "pg" }),
  });

  return betterAuthInstance;
});
