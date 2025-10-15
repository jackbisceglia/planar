import { AuthClient } from "@planar/core/lib/auth/client";
import { RuntimeClient } from "./client.runtime";

export const auth = await RuntimeClient.runPromise(AuthClient);
