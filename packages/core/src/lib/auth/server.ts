import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Effect, Redacted } from "effect";
import { Database } from "../drizzle";
import { AuthConfig } from "../config/auth";
import { WebUrl } from "../config/web";

export const Auth = Effect.gen(function* () {
  const config = yield* AuthConfig.pipe(Effect.orDie);
  const webUrl = yield* WebUrl;
  const database = yield* Database;

  const betterAuthInstance = betterAuth({
    // TODO: fix to be contextual on env
    trustedOrigins: [webUrl],
    socialProviders: {
      github: {
        clientId: config.github.id,
        clientSecret: Redacted.value(config.github.secret),
      },
    },
    database: drizzleAdapter(database, { provider: "pg" }),
  });

  return betterAuthInstance;
});
