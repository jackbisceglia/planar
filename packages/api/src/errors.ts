import { HttpApiError } from "@effect/platform";
import { Effect } from "effect";

export const toInternalServerError = () =>
  Effect.fail(new HttpApiError.InternalServerError());
