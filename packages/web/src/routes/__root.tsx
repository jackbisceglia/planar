/// <reference types="vite/client" />
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/solid-router";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "planar" },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument() {
  return (
    <>
      <HeadContent />
      <body>
        <Outlet />
      </body>
      <Scripts />
    </>
  );
}
