/// <reference types="vite/client" />
import { HydrationScript } from "solid-js/web";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/solid-router";
import css from "../index.css?url";
import { ParentProps } from "solid-js";

// TODO: this should be dynamic based on the user/session
export const defaultWorkspace = "planar";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "planar" },
    ],
    links: [{ rel: "stylesheet", href: css }],
  }),
  context: () => ({ workspace: defaultWorkspace }),
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
