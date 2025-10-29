import { createAuthClient } from "better-auth/solid";
import { organizationClient } from "better-auth/client/plugins";
import { Effect } from "effect";
import { ApiUrl } from "../config/api";

export const AuthClient = Effect.gen(function* () {
  const apiUrl = yield* ApiUrl;

  const betterAuthClientInstance = createAuthClient({ 
    baseURL: apiUrl,
    plugins: [organizationClient()],
  });

  return betterAuthClientInstance;
});
