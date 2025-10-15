import { Effect, Layer } from "effect";
import { PlatformConfigProvider } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";

export function createConfigProviderFromDotEnv(path: string) {
  const Provider = PlatformConfigProvider.fromDotEnv(path);

  const ProviderLayer = Provider.pipe(
    Effect.map(Layer.setConfigProvider),
    Layer.unwrapEffect,
    Layer.provide(NodeContext.layer),
  );

  return ProviderLayer;
}
