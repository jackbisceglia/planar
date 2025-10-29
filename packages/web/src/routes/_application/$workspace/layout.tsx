import {
  createFileRoute,
  ErrorComponentProps,
  Outlet,
} from "@tanstack/solid-router";
import { auth } from "../../../lib/auth/better-auth-client";
import { useSignOut, useUser } from "../../../lib/auth/hooks";
import { ensureTaggedError } from "@planar/core/lib/effect/error";
import { Switch, Show, Suspense } from "solid-js";
import {
  assertUserIsAuthenticated,
  assertWorkspacePathIsValid,
} from "../../../lib/auth/assert";
import { MatchTag } from "../../../lib/utils.solid";
import { useCleanupEffectRuntime } from "../../../lib/setup/client-runtime";
import { WorkspaceSwitcher } from "../../../components/workspace-switcher";
import { useOrganizations, useCurrentWorkspace } from "../../../lib/data/organizations";

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
  const { organizations } = useOrganizations();
  const { currentWorkspace } = useCurrentWorkspace(slug());

  useCleanupEffectRuntime();

  return (
    <main style={{ padding: "1.5rem 2rem", "max-width": "1200px", margin: "0 auto" }}>
      <nav
        style={{
          display: "flex",
          "justify-content": "space-between",
          "align-items": "center",
          "margin-bottom": "2rem",
          "padding-bottom": "1rem",
          "border-bottom": "1px solid #e5e7eb"
        }}
      >
        <div style={{ display: "flex", "align-items": "center", gap: "1rem" }}>
          <Suspense fallback={<div>Loading...</div>}>
            <Show when={organizations()}>
              <div style={{ position: "relative" }}>
                <WorkspaceSwitcher
                  currentWorkspaceSlug={slug()}
                  organizations={organizations() || []}
                />
              </div>
            </Show>
          </Suspense>
        </div>

        <div style={{ display: "flex", "align-items": "center", gap: "1rem" }}>
          <div style={{ 
            display: "flex", 
            "align-items": "center", 
            gap: "0.5rem",
            "font-size": "0.875rem",
            color: "#6b7280"
          }}>
            <Show when={user().image}>
              <img
                src={user().image!}
                alt={user().name}
                style={{
                  width: "24px",
                  height: "24px",
                  "border-radius": "50%",
                  "object-fit": "cover"
                }}
              />
            </Show>
            <span>{user().name}</span>
          </div>
          
          <button
            onClick={() => {
              void signOut();
            }}
            style={{
              padding: "0.5rem 1rem",
              border: "1px solid #e5e7eb",
              "border-radius": "0.375rem",
              background: "white",
              cursor: "pointer",
              "font-size": "0.875rem",
              color: "#374151",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#d1d5db";
              e.currentTarget.style.backgroundColor = "#f9fafb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.backgroundColor = "white";
            }}
          >
            Sign Out
          </button>
        </div>
      </nav>
      
      <Show when={currentWorkspace()}>
        <div style={{ "margin-bottom": "1.5rem" }}>
          <h1 style={{ 
            "font-size": "1.875rem", 
            "font-weight": "700", 
            color: "#111827",
            "margin-bottom": "0.5rem"
          }}>
            {currentWorkspace()?.workspace.name}
          </h1>
          <p style={{ 
            color: "#6b7280", 
            "font-size": "0.875rem" 
          }}>
            {currentWorkspace()?.organization.name}
            <Show when={currentWorkspace()?.workspace.description}>
              {" • " + currentWorkspace()?.workspace.description}
            </Show>
          </p>
        </div>
      </Show>
      
      <Outlet />
    </main>
  );
}
