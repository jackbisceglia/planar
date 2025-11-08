import { TaggedError } from "@planar/core/lib/effect/error";
import { AuthClient, withAuthClient, WithAuthClientExit } from "./auth";
import { Exit } from "effect";
import { safeThrowRedirect } from "./navigation";
import {
  requireValueNonEmptyExit,
  requireValueNonNullishExit,
} from "@planar/core/lib/effect/index";

export class InvalidWorkspaceError extends TaggedError(
  "InvalidWorkspaceError",
) {}

// BetterAuth Success Channel Types
type OrgListResponse = AuthClient["Organization"][] | null;
type OrgActiveResponse = AuthClient["Organization"] | null;

// withAuthClient Exit return types
type OrgListExit<R> = WithAuthClientExit<OrgListResponse, R>;
type OrgActiveExit<R> = WithAuthClientExit<OrgActiveResponse, R>;

// TODO: Prevent workspace slugs from being '_' (reserved for OAuth callback redirect)
// Consider a better pattern for post-auth redirect that doesn't rely on reserved workspace names
export async function handleTopLevelWorkspaceNavigation<RActive, RList>(
  activeResult: OrgActiveExit<RActive>,
  listResult: OrgListExit<RList>,
  pathname: string,
) {
  const ActiveWorkspaceError = new InvalidWorkspaceError("No active workspace");
  const NoWorkspacesError = new InvalidWorkspaceError("No workspaces found");

  const active = activeResult.pipe(
    Exit.flatMap(requireValueNonNullishExit(ActiveWorkspaceError)),
  );

  const list = listResult
    .pipe(Exit.flatMap(requireValueNonNullishExit(NoWorkspacesError)))
    .pipe(Exit.flatMap(requireValueNonEmptyExit(NoWorkspacesError)));

  if (Exit.isFailure(active)) {
    console.log("no active workspace, checking list");
    if (Exit.isSuccess(list)) {
      const firstWorkspace = list.value[0];

      await withAuthClient((c) =>
        c.organization.setActive({
          organizationId: firstWorkspace.id,
          organizationSlug: firstWorkspace.slug,
        }),
      );

      if (pathname !== "/workspaces" && pathname !== "/join") {
        safeThrowRedirect(
          {
            to: "/$workspace",
            params: { workspace: firstWorkspace.slug },
          },
          "workspace",
        );
      }
    } else {
      if (pathname !== "/join") {
        safeThrowRedirect({ to: "/join" }, "workspace");
      }

      return;
    }
    // this should never occur, just to terminate the codepath in favor of throw param ^
    throw new Error("Unknown Workspace Error");
  }
}
