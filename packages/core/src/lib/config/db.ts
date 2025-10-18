import { Config } from "effect";

export const DatabaseConfig = Config.all({
  host: Config.string("SUPABASE_DATABASE_HOST"),
  user: Config.string("SUPABASE_DATABASE_USER"),
  password: Config.string("SUPABASE_DATABASE_PASSWORD"),
  database: Config.string("SUPABASE_DATABASE_NAME"),
  port: Config.number("SUPABASE_DATABASE_PORT").pipe(Config.withDefault(6543)),
});
