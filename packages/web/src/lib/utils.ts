import { WebUrl } from "@planar/core/lib/config/web";
import { RuntimeClient } from "./setup/client-runtime";
import { ApiUrl } from "@planar/core/lib/config/api";
import { Effect } from "effect";

const [web, api] = await RuntimeClient.runPromise(Effect.all([WebUrl, ApiUrl]));

export const webBaseUrl = web;
export const apiBaseUrl = api;
