import { redirect } from "@tanstack/solid-router";
import { auth } from "./better-auth-client";
import { TaggedError } from "@planar/core/lib/effect/error";
import { NonNullableNested } from "@planar/core/lib/utils/index";

class InvalidWorkspaceError extends TaggedError("InvalidWorkspaceError") {}

type AuthenticationData = {
  data: (typeof auth.$Infer)["Session"] | null;
};

type AuthenticationDataChecked = NonNullableNested<
  AuthenticationData,
  "data",
  "user"
>;

export function assertUserIsAuthenticated(
  data: AuthenticationData["data"],
  error: unknown,
): asserts data is AuthenticationDataChecked["data"] {
  console.log("has error", JSON.stringify(error, null, 2));
  console.log("has data", JSON.stringify(data, null, 2));
  if (error || !data) {
    redirect({ throw: true, to: "/" });
  }
}

// TODO: update to pull from persisted user workspace list
export function assertUserCanAccessWorkspace(
  _data: AuthenticationData["data"],
  workspaceMatch: string,
) {
  const temp = "planar";

  if (temp !== workspaceMatch) {
    throw new InvalidWorkspaceError("This workspace does not exist");
  }
}
