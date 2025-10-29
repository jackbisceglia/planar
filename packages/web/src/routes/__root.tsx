/// <reference types="vite/client" />
import { HydrationScript } from "solid-js/web";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/solid-router";
import { ParentProps } from "solid-js";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "planar" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
});

function RootShell(props: ParentProps) {
  return (
    <html>
      <head>
        <HydrationScript />
      </head>
      <body style={{ margin: 0 }}>
        <HeadContent />
        {props.children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
