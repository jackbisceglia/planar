import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
} from "@tanstack/solid-router";
import { auth } from "../../lib/auth/better-auth-client";

export const Route = createFileRoute("/$workspace")({
  component: RouteComponent,
  beforeLoad: async () => {
    const authentication = await auth.getSession();

    if (!authentication.data) {
      return redirect({ to: "/" });
    }

    return {};
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const handleSignOut = async () => {
    await auth.signOut();
  };

  return (
    <>
      <div>Hello "/$workspace-slug"!</div>
      <button
        onClick={() => {
          void handleSignOut();
          void navigate({ reloadDocument: true, to: "/" });
        }}
      >
        Sign Out
      </button>
      <Outlet />
    </>
  );
}
