import {
  createFileRoute,
  ErrorComponentProps,
  Link,
  Outlet,
} from "@tanstack/solid-router";
import { auth } from "../../../lib/auth/better-auth-client";
import { useSignOut, useUser } from "../../../lib/auth/hooks";
import { ensureTaggedError } from "@planar/core/lib/effect/error";
import { Switch } from "solid-js";
import {
  assertUserIsAuthenticated,
  assertWorkspacePathIsValid,
} from "../../../lib/auth/assert";
import { MatchTag } from "../../../lib/utils.solid";
import { slugify } from "../../../lib/utils";

const ErrorComponent = (props: ErrorComponentProps) => {
  const error = ensureTaggedError(props.error);

  return (
    <Switch>
      <MatchTag error={error} tag={"InvalidWorkspaceError"}>
        <p>You are not authorized to access this workspace.</p>
      </MatchTag>
      <MatchTag error={error} tag={"UnknownUIError"}>
        <p>An unexpected error occurred: {error.message}</p>
      </MatchTag>
    </Switch>
  );
};

export const Route = createFileRoute("/_application/$workspace")({
  component: WorkspaceLayout,
  errorComponent: ErrorComponent,
  beforeLoad: async (options) => {
    const authentication = await auth.getSession();

    assertUserIsAuthenticated(authentication);
    assertWorkspacePathIsValid(authentication, options.params.workspace);

    return {
      user: authentication.data.user,
    };
  },
});

function WorkspaceLayout() {
  const user = useUser();
  const slug = Route.useRouteContext({ select: (s) => s.workspace });
  const signOut = useSignOut();

  const workspaceDisplay = () => slugify.decodeCapitalized(slug());

  return (
    <main style={{ padding: "1.5rem 12rem" }}>
      <nav
        style={{
          display: "flex",
          "justify-content": "space-between",
          "align-items": "center",
        }}
      >
        <h2>
          <Link to="/$workspace" params={{ workspace: slug() }}>
            {workspaceDisplay()}
          </Link>
        </h2>

        <button
          onClick={() => {
            void signOut();
          }}
        >
          Sign Out
        </button>
      </nav>
      <p>hey, {user().name.toLowerCase()}</p>
      <Outlet />
    </main>
  );
}
