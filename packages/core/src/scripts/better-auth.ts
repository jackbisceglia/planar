import { Auth } from "../lib/auth/server";
import { RuntimeCli } from "./cli-runtime";

export const auth = await RuntimeCli.runPromise(Auth);
