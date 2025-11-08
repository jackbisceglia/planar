import { createRouter } from "@tanstack/solid-router";
import { routeTree } from "./routeTree.gen";
import { SettingUpWorkspace } from "./lib/components/setting-up";

export function getRouter() {
  const router = createRouter({
    routeTree,
    defaultPendingComponent: SettingUpWorkspace,
    scrollRestoration: true,
  });

  return router;
}
