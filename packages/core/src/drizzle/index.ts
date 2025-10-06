import { Config, Layer, pipe } from "effect";
import * as PgDrizzle from "@effect/sql-drizzle/Pg";
import * as schema from "./schema";
import { PgClient } from "@effect/sql-pg";

// database requirement for drizzle w/ schema type inference
export const Database = PgDrizzle.make<typeof schema>({ schema });

export function getDatabaseUrl() {
  return pipe(
    Config.all({
      host: Config.string("SUPABASE_DATABASE_HOST"),
      user: Config.string("SUPABASE_DATABASE_USER"),
      password: Config.string("SUPABASE_DATABASE_PASSWORD"),
      database: Config.string("SUPABASE_DATABASE_NAME"),
      port: Config.number("SUPABASE_DATABASE_PORT").pipe(
        Config.withDefault(6543),
      ),
    }),
    Config.map(
      (config) =>
        `postgresql://${config.user}:${config.password}@${config.host}:${config.port.toString()}/${config.database}`,
    ),
    (url) => Config.redacted(url),
  );
}

const PgLive = PgClient.layerConfig({
  url: getDatabaseUrl(),
  prepare: Config.succeed(false),
});

const DrizzleLive = PgDrizzle.layer.pipe(Layer.provide(PgLive));

export const DatabaseLive = Layer.mergeAll(PgLive, DrizzleLive);
