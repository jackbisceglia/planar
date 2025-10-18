import { Config, Effect } from "effect";
import { buildUrlWithPortOptional } from "../utils";

export const ApiConfig = Config.all({
  port: Config.number("VITE_API_PORT").pipe(Config.withDefault(undefined)),
  url: Config.string("VITE_API_URL"),
});

export const ApiUrl = Effect.gen(function* () {
  const config = yield* ApiConfig.pipe(Effect.orDie);

  return buildUrlWithPortOptional(config.url, config.port);
});
