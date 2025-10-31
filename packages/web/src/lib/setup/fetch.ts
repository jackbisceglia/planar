import { FetchHttpClient } from "@effect/platform";
import { Layer } from "effect";

const InitLayer = Layer.succeed(FetchHttpClient.RequestInit, {
  credentials: "include",
});

export const FetchClient = FetchHttpClient.layer.pipe(Layer.provide(InitLayer));
