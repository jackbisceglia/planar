import { Layer, ManagedRuntime } from "effect";
import { NodeContext } from "@effect/platform-node";
import { createConfigProviderFromDotEnv } from "../lib/effect/config.from-dotenv";
import { Issues } from "../modules/issues/entity";
import { DatabaseLive } from "../lib/drizzle";

export const DotEnvConfigProvider =
  createConfigProviderFromDotEnv("../../.env");

export const RuntimeCli = NodeContext.layer
  .pipe(Layer.merge(DatabaseLive))
  .pipe(Layer.merge(Issues.Default))
  .pipe(Layer.provide(DotEnvConfigProvider))
  .pipe(ManagedRuntime.make);
