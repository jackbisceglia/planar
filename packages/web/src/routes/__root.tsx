/// <reference types="vite/client" />
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/solid-router";
import { useCleanupEffectRuntime } from "../lib/setup/client-runtime";

// TODO: this should be dynamic based on the user/session
export const defaultWorkspace = "planar";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "planar" },
    ],
  }),
  component: Root,
  context: () => ({ workspace: defaultWorkspace }),
});

function Root() {
  useCleanupEffectRuntime();

  return (
    <>
      <HeadContent />
      <Outlet />
      <Scripts />
    </>
  );
}
