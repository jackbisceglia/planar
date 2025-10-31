import {
  createFileRoute,
  ErrorComponentProps,
  Link,
  Outlet,
} from "@tanstack/solid-router";
import { useSignOut, useUser } from "../../../lib/auth/hooks";
import { ensureTaggedError } from "@planar/core/lib/effect/error";
import { Switch } from "solid-js";
import { MatchTag } from "../../../lib/utils/solid";
import { auth } from "~/lib/auth/better-auth-client";
// import { assertUserCanAccessWorkspace } from "~/lib/auth/assert";

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
  beforeLoad: (_options) => {
    // const authentication = options.context.authentication;
    // TODO: add logic to check, once i figre out non-hook workspace logic
    // assertUserCanAccessWorkspace(authentication, options.params.workspace);
  },
});

function WorkspaceLayout() {
  const user = useUser();
  const signOut = useSignOut();
  const workspace = auth.useActiveOrganization();

  return (
    // <Show when={workspace().data}>
    // {(workspace) => (
    <main style={{ padding: "1.5rem 12rem" }}>
      <nav
        style={{
          display: "flex",
          "justify-content": "space-between",
          "align-items": "center",
        }}
      >
        <h2>
          <Link
            to="/$workspace"
            params={{ workspace: workspace().data?.slug ?? "" }}
          >
            {workspace().data?.name}
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
      {/* for some reason this is throwing even though we first check if user exists */}
      <p>hey, {user().name.toLowerCase()}</p>
      <Outlet />
    </main>
    // )}
    // </Show>
  );
}
