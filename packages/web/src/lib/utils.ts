import { WebUrl } from "@planar/core/lib/config/web";
import { RuntimeClient } from "./client-runtime";

export const url = await WebUrl.pipe(RuntimeClient.runPromise);
