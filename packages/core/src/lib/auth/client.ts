import { createAuthClient } from "better-auth/solid";
import { Effect } from "effect";
import { ApiUrl } from "../config/api";

export const AuthClient = Effect.gen(function* () {
  const apiUrl = yield* ApiUrl;

  const betterAuthClientInstance = createAuthClient({ baseURL: apiUrl });

  return betterAuthClientInstance;
});
