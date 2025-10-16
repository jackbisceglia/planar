import { HttpApiClient } from "@effect/platform";
import { Effect } from "effect";
import { Api } from "@planar/core/lib/contracts/index";
import { RuntimeClient } from "./client-runtime";
import { ApiUrl } from "@planar/core/lib/config/api";

type RpcClient = Effect.Effect.Success<typeof RpcClient>;

const RpcClient = ApiUrl.pipe(
  Effect.flatMap((baseUrl) => HttpApiClient.make(Api, { baseUrl })),
);

export function withRpc(name: string) {
  return function <A, E>(fn: (rpc: RpcClient) => Effect.Effect<A, E>) {
    const call = Effect.fn(`${name}.rpc`)(function* () {
      const client = yield* RpcClient;

      const result = yield* fn(client);

      return result;
    });

    return () => RuntimeClient.runPromise(call());
  };
}
