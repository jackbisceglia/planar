import { Layer, ManagedRuntime } from "effect";
import { NodeContext } from "@effect/platform-node";
import { createConfigProviderFromDotEnv } from "@planar/core/lib/effect/config.from-dotenv";

export const DotEnvConfigProvider =
  createConfigProviderFromDotEnv("../../.env");

export const RuntimeServer = NodeContext.layer
  .pipe(Layer.merge(DotEnvConfigProvider))
  .pipe(ManagedRuntime.make);
