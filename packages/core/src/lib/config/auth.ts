import { Config } from "effect";

export const AuthConfig = Config.all({
  secret: Config.redacted(Config.string("AUTH_SECRET")),
  github: Config.all({
    id: Config.string("AUTH_GITHUB_CLIENT_ID"),
    secret: Config.redacted(Config.string("AUTH_GITHUB_CLIENT_SECRET")),
  }),
});
