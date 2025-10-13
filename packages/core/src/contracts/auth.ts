import { HttpApiEndpoint, HttpApiError, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";

export const AuthGroup = HttpApiGroup.make("auth")
  .add(HttpApiEndpoint.get("get", "/*").addSuccess(Schema.Any))
  .add(HttpApiEndpoint.post("post", "/*").addSuccess(Schema.Any))
  .addError(HttpApiError.Unauthorized)
  .prefix("/auth");
