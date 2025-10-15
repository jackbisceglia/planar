import { Layer, ManagedRuntime } from "effect";
import { NodeContext } from "@effect/platform-node";
import { createConfigProviderFromDotEnv } from "@planar/core/lib/effect/config.from-dotenv";
import { DatabaseLive } from "@planar/core/lib/drizzle/index";
import { Issues } from "@planar/core/modules/issues/entity";

export const DotEnvConfigProvider =
  createConfigProviderFromDotEnv("../../.env");

export const RuntimeServer = NodeContext.layer
  .pipe(Layer.merge(DatabaseLive))
  .pipe(Layer.merge(Issues.Default))
  .pipe(Layer.provide(DotEnvConfigProvider))
  .pipe(ManagedRuntime.make);
