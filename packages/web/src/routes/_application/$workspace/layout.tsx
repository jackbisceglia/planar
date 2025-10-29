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
import { useCleanupEffectRuntime } from "../../../lib/setup/client-runtime";
import { WorkspaceSwitcher } from "../../../lib/components/WorkspaceSwitcher";

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
    await assertWorkspacePathIsValid(authentication, options.params.workspace);

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

  useCleanupEffectRuntime();

  return (
    <main style="min-height: 100vh; background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%); color: #ffffff;">
      <nav
        style="border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; backdrop-filter: blur(10px); background: rgba(15, 15, 15, 0.95);"
      >
        <div style="display: flex; align-items: center; gap: 16px;">
          <WorkspaceSwitcher currentSlug={slug()} />
          <Link 
            to="/$workspace" 
            params={{ workspace: slug() }}
            style="font-size: 20px; font-weight: 700; color: #ffffff; text-decoration: none; letter-spacing: -0.5px;"
          >
            {workspaceDisplay()}
          </Link>
        </div>

        <div style="display: flex; align-items: center; gap: 16px;">
          <span style="color: #a0a0a0; font-size: 14px;">
            {user().name}
          </span>
          <button
            onClick={() => {
              void signOut();
            }}
            style="padding: 8px 16px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; color: #ffffff; cursor: pointer; transition: all 0.2s; font-weight: 600; font-size: 14px;"
            onmouseover={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
            }}
            onmouseout={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            }}
          >
            Sign Out
          </button>
        </div>
      </nav>
      <div style="padding: 32px 24px; max-width: 1200px; margin: 0 auto;">
        <Outlet />
      </div>
    </main>
  );
}
