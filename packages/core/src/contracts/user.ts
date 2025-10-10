import { HttpApiEndpoint, HttpApiError, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";

export const UsersGroup = HttpApiGroup.make("users")
  .add(
    HttpApiEndpoint.get("get")`/`
      .setPayload(Schema.Struct({ id: Schema.String }))
      .addError(HttpApiError.NotFound)
      .addSuccess(Schema.Union(Schema.String, Schema.Null)),
  )
  .add(
    HttpApiEndpoint.post("create")`/`
      .setPayload(
        Schema.Struct({
          name: Schema.String,
          email: Schema.String,
        }),
      )
      .addError(HttpApiError.BadRequest)
      .addSuccess(Schema.String),
  )
  .prefix("/users");
