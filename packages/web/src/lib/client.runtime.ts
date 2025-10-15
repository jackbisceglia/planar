import { FetchHttpClient } from "@effect/platform";
import { createConfigProviderFromViteEnv } from "@planar/core/lib/effect/config-from-vite";
import { Layer, ManagedRuntime } from "effect";

export const ViteEnvConfigProviderLayer = createConfigProviderFromViteEnv(
  import.meta.env,
);

export const RuntimeClient = Layer.empty
  .pipe(Layer.merge(ViteEnvConfigProviderLayer))
  .pipe(Layer.merge(FetchHttpClient.layer))
  .pipe(ManagedRuntime.make);
