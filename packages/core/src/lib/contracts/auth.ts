import { HttpApiEndpoint, HttpApiError, HttpApiGroup } from "@effect/platform";

export const AuthGroup = HttpApiGroup.make("auth")
  .add(HttpApiEndpoint.get("get")`/*`)
  .add(HttpApiEndpoint.post("post")`/*`)
  .addError(HttpApiError.Unauthorized)
  .prefix("/auth");
