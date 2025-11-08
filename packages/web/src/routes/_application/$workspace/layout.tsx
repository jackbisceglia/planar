import {
  createFileRoute,
  ErrorComponentProps,
  Link,
  Outlet,
} from "@tanstack/solid-router";
import { useSignOut, useUser, useWorkspace } from "../../../lib/auth/hooks";
import { ensureTaggedError } from "@planar/core/lib/effect/error";
import { Switch } from "solid-js";
import { MatchTag } from "../../../lib/utils/solid";
import { safeThrowRedirect } from "~/lib/navigation";

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
  beforeLoad: (options) => {
    const workspaces = options.context.workspaces;

    if (!workspaces.active) {
      throw safeThrowRedirect({ to: "/workspaces" }, "workspace");
    }

    return {
      workspaces: {
        active: workspaces.active,
        list: workspaces.list ?? [workspaces.active],
      },
    };
  },
});

function WorkspaceLayout() {
  const user = useUser();
  const signOut = useSignOut();
  const workspace = useWorkspace();

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
          <Link to="/$workspace" params={{ workspace: workspace().slug }}>
            {workspace().name}
          </Link>
        </h2>

        <div
          style={{ display: "flex", gap: "0.75rem", "align-items": "center" }}
        >
          <Link to="/workspaces">
            <button>Switch workspace</button>
          </Link>
          <button
            onClick={() => {
              void signOut();
            }}
          >
            Sign Out
          </button>
        </div>
      </nav>
      <p>hey, {user().name.toLowerCase()}</p>
      <Outlet />
    </main>
  );
}
