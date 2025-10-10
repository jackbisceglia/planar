import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import viteSolid from "vite-plugin-solid";

export default defineConfig({
  envDir: "../../",
  server: { port: 3000 },
  plugins: [
    tsConfigPaths(),
    tanstackStart({ spa: { enabled: true } }),
    viteSolid({ ssr: true }), // must come after start's vite plugin
  ],
});
