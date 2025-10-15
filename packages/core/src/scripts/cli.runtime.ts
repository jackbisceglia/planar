import { Effect, Layer, ManagedRuntime } from "effect";
import { NodeContext } from "@effect/platform-node";
import { createConfigProviderFromDotEnv } from "../lib/effect/config.from-dotenv";
import { Users } from "../modules/users/entity";
import { DatabaseLive } from "../lib/drizzle";

export const DotEnvConfigProvider =
  createConfigProviderFromDotEnv("../../.env");

export const RuntimeCli = NodeContext.layer
  .pipe(Layer.merge(DatabaseLive))
  .pipe(Layer.merge(Users.Default))
  .pipe(Layer.provide(DotEnvConfigProvider))
  .pipe(ManagedRuntime.make);
