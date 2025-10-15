import { createAuthClient } from "better-auth/solid";
import { Effect } from "effect";
import { getApiUrl } from "../utils/constants";

export const AuthClient = Effect.gen(function* () {
  const url = yield* getApiUrl();

  const betterAuthClientInstance = createAuthClient({
    baseURL: url,
  });

  return betterAuthClientInstance;
});
