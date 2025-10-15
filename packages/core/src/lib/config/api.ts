import { Config } from "effect";

export const ApiConfig = Config.all({
  port: Config.number("VITE_API_PORT").pipe(Config.withDefault(undefined)),
  url: Config.string("VITE_API_URL"),
});
