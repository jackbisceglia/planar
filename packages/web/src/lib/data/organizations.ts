import { createResource } from "solid-js";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  avatarUrl?: string;
  isPersonal: boolean;
  role: "owner" | "admin" | "member" | "guest";
  workspaces: Workspace[];
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  organizationId: string;
  role: "owner" | "admin" | "member" | "guest";
}

// TODO: Re-enable organization API calls after fixing backend
// For now, return mock data
const getMockOrganizations = (): Organization[] => [
  {
    id: "org-1",
    name: "Personal",
    slug: "personal",
    isPersonal: true,
    role: "owner",
    workspaces: [
      {
        id: "ws-1",
        name: "Personal",
        slug: "personal",
        organizationId: "org-1",
        role: "owner",
      },
    ],
  },
  {
    id: "org-2", 
    name: "Acme Corp",
    slug: "acme-corp",
    isPersonal: false,
    role: "owner",
    workspaces: [
      {
        id: "ws-2",
        name: "General",
        slug: "general",
        organizationId: "org-2",
        role: "owner",
      },
      {
        id: "ws-3",
        name: "Engineering",
        slug: "engineering", 
        organizationId: "org-2",
        role: "owner",
      },
    ],
  },
];

// Hook for managing organizations
export function useOrganizations() {
  const [organizations] = createResource(async () => getMockOrganizations());
  
  return {
    organizations,
    refetch: () => {}, // TODO: Implement refetch
    createOrganization: async () => {}, // TODO: Implement
    createWorkspace: async () => {}, // TODO: Implement
    loading: organizations.loading,
    error: organizations.error,
  };
}

// Hook for current workspace context
export function useCurrentWorkspace(workspaceSlug: string) {
  const { organizations } = useOrganizations();
  
  const currentWorkspace = () => {
    const orgs = organizations();
    if (!orgs) return null;
    
    for (const org of orgs) {
      const workspace = org.workspaces.find((w: Workspace) => w.slug === workspaceSlug);
      if (workspace) {
        return { workspace, organization: org };
      }
    }
    return null;
  };

  return {
    currentWorkspace,
    isLoading: organizations.loading,
  };
}

// Helper to check if user has permission in workspace
export function hasWorkspacePermission(
  role: "owner" | "admin" | "member" | "guest",
  requiredLevel: "owner" | "admin" | "member" | "guest"
): boolean {
  const levels = { guest: 0, member: 1, admin: 2, owner: 3 };
  return levels[role] >= levels[requiredLevel];
}