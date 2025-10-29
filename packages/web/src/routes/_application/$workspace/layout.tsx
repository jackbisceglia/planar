import {
  createFileRoute,
  ErrorComponentProps,
  Link,
  Outlet,
  redirect,
} from "@tanstack/solid-router";
import { auth } from "../../../lib/auth/better-auth-client";
import { useSignOut, useUser } from "../../../lib/auth/hooks";
import { ensureTaggedError } from "@planar/core/lib/effect/error";
import { Switch } from "solid-js";
import { assertUserIsAuthenticated, assertWorkspacePathIsValid } from "../../../lib/auth/assert";
import { MatchTag } from "../../../lib/utils.solid";
import { slugify } from "../../../lib/utils";
import { defaultWorkspace } from "../../__root";
import { useCleanupEffectRuntime } from "../../../lib/setup/client-runtime";
import { withRpc } from "../../../lib/data/rpc-client";
import { useNavigate } from "@tanstack/solid-router";

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
  ssr: false,
  component: WorkspaceLayout,
  errorComponent: ErrorComponent,
  beforeLoad: async (options) => {
    const authentication = await auth.getSession();

    assertUserIsAuthenticated(authentication);

    const user = authentication.data.user;

    const listUserWorkspaces = () =>
      withRpc("list-user-workspaces")((rpc) =>
        rpc.workspaces.listMine({ payload: { userId: user.id } }),
      );

    const workspaces = await listUserWorkspaces();
    const allowedSlugs = (workspaces.length > 0
      ? workspaces
      : [{ id: "00000000-0000-0000-0000-000000000000", slug: defaultWorkspace, name: "Default", role: "member" }]
    ).map((w) => w.slug);

    // manage persisted active workspace per user
    const storageKey = `planar:active_workspace:${user.id}`;
    const requested = options.params.workspace;
    const stored = typeof localStorage !== "undefined" ? localStorage.getItem(storageKey) : null;

    let resolved = requested;
    if (!allowedSlugs.includes(resolved)) {
      const fallback = stored && allowedSlugs.includes(stored) ? stored : allowedSlugs[0];

      if (fallback) {
        // redirect to the first available workspace
        redirect({ throw: true, to: "/$workspace", params: { workspace: fallback } });
      }

      // if user has no workspaces, keep requested but validation will fail
    }

    // persist resolved
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(storageKey, resolved);
      }
    } catch {}

    assertWorkspacePathIsValid(authentication, resolved, allowedSlugs);

    return {
      user,
      workspaces,
      workspace: resolved,
    };
  },
});

function WorkspaceLayout() {
  const user = useUser();
  const slug = Route.useRouteContext({ select: (s) => s.workspace });
  const workspaces = Route.useRouteContext({ select: (s) => s.workspaces });
  const workspaceOptions = () =>
    (workspaces && workspaces.length > 0
      ? workspaces
      : [
          {
            id: "00000000-0000-0000-0000-000000000000",
            slug: defaultWorkspace,
            name: "Default",
            role: "member",
          },
        ]);
  const signOut = useSignOut();
  const navigate = useNavigate();

  const workspaceDisplay = () => slugify.decodeCapitalized(slug());

  useCleanupEffectRuntime();

  return (
    <main style={{ padding: "1.5rem 12rem" }}>
      <nav
        style={{
          display: "flex",
          "justify-content": "space-between",
          "align-items": "center",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
          <h2 style={{ margin: 0 }}>
            <Link to="/$workspace" params={{ workspace: slug() }}>
              {workspaceDisplay()}
            </Link>
          </h2>
          <select
            value={slug()}
            onChange={(e) => {
              const next = e.currentTarget.value;
              // persist selection per user
              try {
                localStorage.setItem(`planar:active_workspace:${user().id}`, next);
              } catch {}
              void navigate({ to: "/$workspace", params: { workspace: next } });
            }}
          >
            {workspaceOptions().map((w) => (
              <option value={w.slug}>{slugify.decodeCapitalized(w.slug)}</option>
            ))}
          </select>
        </div>

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
