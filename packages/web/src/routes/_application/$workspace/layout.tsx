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
import { slugify } from "../../../lib/utils";
import { assertUserCanAccessWorkspace } from "~/lib/auth/assert";

const ErrorComponent = (props: ErrorComponentProps) => {
  console.log("has error in layout", JSON.stringify(props.error, null, 2));

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
    const authentication = options.context.authentication;

    assertUserCanAccessWorkspace(authentication, options.params.workspace);
  },
});

function WorkspaceLayout() {
  const slug = Route.useRouteContext({ select: (s) => s.workspace });
  const user = useUser();
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
      {/* for some reason this is throwing even though we first check if user exists */}
      <p>hey, {user().name.toLowerCase()}</p>
      <Outlet />
    </main>
  );
}
