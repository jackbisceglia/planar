import { AuthClient } from "@planar/core/lib/auth/client";
import { RuntimeClient } from "../setup/client-runtime";

export const auth = await RuntimeClient.runPromise(AuthClient);
