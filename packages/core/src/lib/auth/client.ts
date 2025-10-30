import { createAuthClient } from "better-auth/solid";
import { Effect } from "effect";
import { ApiUrl } from "../config/api";
import { organizationClient } from "better-auth/client/plugins";

export const AuthClient = Effect.gen(function* () {
  const apiUrl = yield* ApiUrl;

  const betterAuthClientInstance = createAuthClient({
    baseURL: apiUrl,
    plugins: [organizationClient()],
  });

  return betterAuthClientInstance;
});
