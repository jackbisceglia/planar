import { Layer, ManagedRuntime } from "effect";
import { NodeContext } from "@effect/platform-node";
import { createConfigProviderFromDotEnv } from "../lib/effect/config.from-dotenv";
import { Users } from "../modules/users/entity";

export const DotEnvConfigProvider =
  createConfigProviderFromDotEnv("../../.env");

export const RuntimeCli = NodeContext.layer
  .pipe(Layer.merge(DotEnvConfigProvider))
  .pipe(Layer.merge(Users.Default))
  .pipe(ManagedRuntime.make);
