import { FetchHttpClient, HttpApiClient } from "@effect/platform";
import { getApiUrl } from "@planar/core/contracts/config";
import { Api } from "@planar/core/contracts/index";
import { Effect, pipe } from "effect";
import { ViteEnvConfigProviderLayer } from "./env";

type RpcClient = Effect.Effect.Success<typeof RpcClient>;

const RpcClient = pipe(
  getApiUrl(),
  Effect.flatMap((baseUrl) => HttpApiClient.make(Api, { baseUrl })),
  Effect.provide(FetchHttpClient.layer),
  Effect.provide(ViteEnvConfigProviderLayer),
);

export function withRpc(name: string) {
  return function <A, E>(fn: (rpc: RpcClient) => Effect.Effect<A, E>) {
    const call = Effect.fn(`${name}.rpc`)(function* () {
      const client = yield* RpcClient;

      const result = yield* fn(client);

      return result;
    });

    return () => Effect.runPromise(call());
  };
}
