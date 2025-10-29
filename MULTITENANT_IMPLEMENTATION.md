# Multi-Tenant Organization Infrastructure Implementation

## Overview
This implementation adds full multi-tenant organization support to the Planar application, inspired by Slack and Linear's workspace switcher patterns. Users can now create multiple workspaces, switch between them seamlessly, and have all data properly scoped to each organization.

## Key Features

### 1. Database Schema Changes
- **Organization Table**: Stores workspace/organization metadata (name, slug, logo, metadata)
- **Member Table**: Manages user-organization relationships with roles
- **Invitation Table**: Handles organization invitations
- **Session Enhancement**: Added `activeOrganizationId` to track current workspace
- **Issue Scoping**: All issues are now scoped to organizations via `organizationId` foreign key

### 2. Authentication & Authorization
- Integrated better-auth's organization plugin
- Added organization client plugin to frontend
- Workspace access validation in route guards
- Automatic organization activation when switching workspaces

### 3. UI Components

#### Workspace Switcher (`WorkspaceSwitcher.tsx`)
A Slack/Linear-inspired dropdown component that:
- Shows all user's organizations
- Displays current active workspace
- Allows quick switching between workspaces
- Includes "Create new workspace" option
- Features smooth animations and professional styling

#### Workspace Selection Page (`select-workspace.tsx`)
Full-page workspace selection/creation flow that:
- Lists all available workspaces
- Provides workspace creation form with auto-slug generation
- Redirects users after workspace selection
- Serves as landing page for new users

### 4. Workspace-Scoped API Routes
All issue APIs now require and validate `organizationId`:
- `GET /issues/all` - Fetches issues for specific organization
- `GET /issues/` - Gets single issue with organization check
- `POST /issues/` - Creates issue in specific organization

### 5. Routing & Navigation
- Removed hardcoded `defaultWorkspace` constant
- Dynamic workspace detection from user's organizations
- Automatic redirect to workspace selection if no organizations exist
- OAuth callback redirects to workspace selection

## File Changes

### Core Package (`packages/core/`)
```
src/modules/auth/schema.ts
  + organization table (id, name, slug, logo, metadata)
  + member table (organization_id, user_id, role)
  + invitation table (organization_id, email, role, status)
  + session.activeOrganizationId field

src/modules/issues/schema.ts
  + organizationId field for workspace scoping

src/modules/issues/entity.ts
  + organizationId parameter for all queries
  + Workspace-scoped filtering

src/lib/auth/server.ts
  + organization plugin configuration
  + sendInvitationEmail stub

src/lib/auth/client.ts
  + organizationClient plugin

src/lib/contracts/issues.ts
  + organizationId in API payloads
```

### API Package (`packages/api/`)
```
src/routes.issues.ts
  + Pass organizationId to entity methods
  + Workspace-scoped data access
```

### Web Package (`packages/web/`)
```
src/lib/components/WorkspaceSwitcher.tsx (NEW)
  + Dropdown workspace switcher component
  + Organization listing and switching
  + Create workspace link

src/routes/_application/select-workspace.tsx (NEW)
  + Full-page workspace selection
  + Workspace creation form
  + Auto-slug generation

src/routes/_application/$workspace/layout.tsx
  + Integrated WorkspaceSwitcher component
  + Enhanced navigation styling
  + Modern dark theme

src/routes/_application/$workspace/index.tsx
  + Pass organizationId to API calls
  + Enhanced issue UI
  + Workspace-scoped issue fetching

src/lib/auth/assert.ts
  + Dynamic workspace validation
  + Organization membership check
  + Auto-activation of selected workspace

src/routes/_public/index.tsx
  + Smart redirect logic based on user's organizations
  + Redirect to select-workspace if no orgs

src/routes/__root.tsx
  + Removed hardcoded defaultWorkspace

src/lib/auth/hooks.ts
  + OAuth callback to select-workspace page
```

## Migration

A database migration was generated at `packages/core/drizzle/0000_faulty_dagger.sql` containing:
- All auth tables (user, session, account, verification)
- Organization infrastructure tables
- Updated issue table with organization_id
- All necessary foreign key constraints

## User Flow

### New User Journey
1. User signs in via GitHub OAuth
2. Redirected to `/select-workspace`
3. Can create first workspace or join existing via invitation
4. Redirected to `/$workspace` with new workspace slug

### Existing User Journey
1. User signs in via GitHub OAuth
2. Automatically redirected to their active workspace (or first workspace)
3. Can switch workspaces via WorkspaceSwitcher dropdown
4. All data is properly scoped to active workspace

### Multi-Workspace Usage
1. Click workspace name in top-left navigation
2. Dropdown shows all available workspaces
3. Click any workspace to instantly switch
4. Click "Create workspace" to add new organization
5. Session maintains active workspace across page loads

## Design Decisions

### Similar to Slack/Linear
- **Workspace Switcher**: Top-left dropdown with organization list
- **Visual Identity**: Each workspace has colored avatar with first letter
- **Quick Switch**: Single click to change workspaces
- **Modern UI**: Dark theme with smooth transitions

### Technical Choices
- Used better-auth's native organization plugin for robust auth
- Stored activeOrganizationId in session for persistence
- All API calls require explicit organizationId (no implicit context)
- Workspace validation happens at route level (beforeLoad)

## Testing Checklist

- [ ] User can create new workspace
- [ ] User can switch between workspaces
- [ ] Issues are properly scoped per workspace
- [ ] Can't access workspace without membership
- [ ] OAuth flow redirects to workspace selection
- [ ] Active workspace persists across sessions
- [ ] Workspace slug validation works
- [ ] Multiple users can share workspace (via invitations)

## Future Enhancements

1. **Workspace Settings Page**
   - Rename workspace
   - Update logo
   - Delete workspace

2. **Team Management**
   - Invite team members
   - Manage roles (owner, admin, member)
   - Remove members

3. **Workspace Personalization**
   - Custom colors per workspace
   - Workspace avatars/logos
   - Workspace descriptions

4. **Enhanced Navigation**
   - Recent workspaces
   - Favorites/pinning
   - Keyboard shortcuts (Cmd+K workspace switcher)

5. **Audit & Activity**
   - Track workspace switches
   - Member activity logs
   - Workspace analytics

## Notes for Deployment

1. Run database migration before deploying: `pnpm db:migrate`
2. Existing users will need to create/join at least one workspace
3. Configure email provider for invitation emails
4. Consider migrating existing data to default organization if applicable
