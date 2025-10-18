import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Effect, Redacted } from "effect";
import { Database } from "../drizzle";
import { AuthConfig } from "../config/auth";
import { WebUrl } from "../config/web";
import { application, withStage } from "../config/meta";
import { ApiUrl } from "../config/api";

export const Auth = Effect.gen(function* () {
  const database = yield* Database;

  const authConfig = yield* AuthConfig.pipe(Effect.orDie);

  const apiBaseUrl = yield* ApiUrl;
  const webBaseUrl = yield* WebUrl;

  const appName = yield* withStage(application);

  const betterAuthInstance = betterAuth({
    appName: appName,
    baseUrl: apiBaseUrl,
    trustedOrigins: [webBaseUrl],
    socialProviders: {
      github: {
        clientId: authConfig.github.id,
        clientSecret: Redacted.value(authConfig.github.secret),
      },
    },
    database: drizzleAdapter(database, { provider: "pg" }),
  });

  return betterAuthInstance;
});
