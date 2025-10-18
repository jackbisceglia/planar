# planar

### a linear clone

a [linear](https://linear.app/) clone built with:

- [effect](https://effect.website) - typescript framework for type-safe, composable programs
- [solid.js](https://solidjs.com) - reactive ui library
- [tanstack start](https://tanstack.com/start/latest) - full-stack web framework
- [zero](https://zero.rocicorp.dev/) - [todo] sync engine

### install

**requirements:**

- node lts (v22.20.0) - pinned in package.json
- [pnpm](https://pnpm.io)

**setup:**

1. copy `.env.template` to `.env`
2. configure database fields with any postgres transaction pooler endpoint
   - easiest: setup a [supabase](https://supabase.com) project → click connect → transaction pooler section → copy parameters
3. configure auth fields:
   - set `AUTH_SECRET` using `openssl rand -base64 32`
   - create github oauth app via https://github.com/settings/developers
     - app name: anything (e.g., 'planar-dev')
     - homepage url: `http://localhost:3000`
     - authorization callback url: `http://localhost:3001/api/auth/callback/github`
     - copy client_id/secret to `.env`
   - set `VITE_STAGE` to your environment identifier (e.g. foo-bar) to signify the environment that code is being run in
4. `pnpm install`

### repo structure

- `/core` - shared code
  - `/lib` - library-level re-usable code
  - `/modules` - application level domain code
  - `/contracts` - api definitions
  - `/scripts` - this shouldn't really live in /src, but it simplifies the tsconfig/eslint setup, so one-off scripts
- `/web` - web app (solid.js + tanstack start)
- `/api` - http api (effect/platform)

### commands

- `pnpm lint` - run eslint across all packages (recursively)
- `pnpm typecheck` - check typescript build status (recursively)
- `pnpm format` - run prettier across all packages (recursively)
- `pnpm @core` / `@web` / `@api <command>` - run command in specific package (recursively)
  - e.g. `pnpm @web add react`

### database

- define tables in `packages/core/src/modules/**/schema.ts`, as drizzle cli looks here
- re-export tables in `packages/core/src/lib/drizzle/schema.ts`, for orm type safety
- `pnpm @core db push` - push schema changes to database

### conventions

- dev dependencies go in the root `package.json` (hoisted, not needed for runtime)
- runtime dependencies go in the per-package `package.json` (each package builds independently)
- shared dependencies go in the `pnpm-workspace.yaml` catalog section, referenced as `"catalog:"` in package.json to match versions
