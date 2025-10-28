import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteSolid from "vite-plugin-solid";
import path from "path";

export default defineConfig({
  envDir: "../../",
  server: { port: 3000 },
  plugins: [
    tailwindcss(),
    tsConfigPaths(),
    tanstackStart({
      router: { routeToken: "layout" },
    }),
    viteSolid({ ssr: true }), // must come after start's vite plugin
  ],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
});
