import { createFileRoute } from "@tanstack/solid-router";
import { createResource, Show, Suspense } from "solid-js";
import { withRpc } from "../lib/rpc";
import { getApiUrl } from "@planar/core/contracts/config";
import { ConfigProvider, Effect, Layer } from "effect";

const ViteEnvConfigProvider = ConfigProvider.fromJson(import.meta.env).pipe(
  Layer.setConfigProvider,
);

export const getApiUrlSync = () =>
  getApiUrl()
    .pipe(Effect.provide(ViteEnvConfigProvider))
    .pipe(Effect.runPromise);

export const Route = createFileRoute("/")({ component: HomeRoute });

const fallbacks = {
  fetching: () => <p>Loading...</p>,
  notFound: () => <p>User Not Found</p>,
};

function HomeRoute() {
  const [data] = createResource(
    withRpc("fetchUser")((rpc) =>
      rpc.users.get({ payload: { id: crypto.randomUUID() } }),
    ),
  );

  return (
    <>
      <h1>testing effect rpc</h1>
      <Suspense fallback={fallbacks.fetching()}>
        <Show when={data()} fallback={fallbacks.notFound()}>
          <p>1: {data()}</p>
        </Show>
      </Suspense>
    </>
  );
}
