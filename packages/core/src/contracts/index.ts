import { HttpApi, HttpApiError } from "@effect/platform";
import { UsersGroup } from "./user";
import { AuthGroup } from "./auth";

export const Api = HttpApi.make("Api")
  .add(UsersGroup)
  .add(AuthGroup)
  .addError(HttpApiError.InternalServerError);
