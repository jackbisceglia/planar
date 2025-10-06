import { Effect, Layer } from "effect";
import { PlatformConfigProvider } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";

const DotEnvConfigProvider = PlatformConfigProvider.fromDotEnv("../../.env");

export const DotEnvConfigProviderLayer = DotEnvConfigProvider.pipe(
  Effect.map(Layer.setConfigProvider),
  Layer.unwrapEffect,
  Layer.provide(NodeContext.layer),
);
