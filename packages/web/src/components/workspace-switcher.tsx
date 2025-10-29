import { createSignal, For, Show, createEffect } from "solid-js";
import { useNavigate } from "@tanstack/solid-router";

interface Organization {
  id: string;
  name: string;
  slug: string;
  avatarUrl?: string;
  isPersonal: boolean;
  role: "owner" | "admin" | "member" | "guest";
  workspaces: Workspace[];
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  organizationId: string;
  role: "owner" | "admin" | "member" | "guest";
}

interface WorkspaceSwitcherProps {
  currentWorkspaceSlug: string;
  organizations: Organization[];
  onWorkspaceChange?: (workspaceSlug: string) => void;
}

export function WorkspaceSwitcher(props: WorkspaceSwitcherProps) {
  const [isOpen, setIsOpen] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal("");
  const navigate = useNavigate();

  const currentWorkspace = () => {
    for (const org of props.organizations) {
      const workspace = org.workspaces.find(w => w.slug === props.currentWorkspaceSlug);
      if (workspace) {
        return { workspace, organization: org };
      }
    }
    return null;
  };

  const filteredOrganizations = () => {
    const query = searchQuery().toLowerCase();
    if (!query) return props.organizations;

    return props.organizations.map(org => ({
      ...org,
      workspaces: org.workspaces.filter(workspace =>
        workspace.name.toLowerCase().includes(query) ||
        org.name.toLowerCase().includes(query)
      )
    })).filter(org => org.workspaces.length > 0);
  };

  const handleWorkspaceSelect = (workspaceSlug: string) => {
    setIsOpen(false);
    setSearchQuery("");
    props.onWorkspaceChange?.(workspaceSlug);
    navigate({ to: "/$workspace", params: { workspace: workspaceSlug } });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  createEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-workspace-switcher]')) {
        setIsOpen(false);
      }
    };

    if (isOpen()) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
    return undefined;
  });

  const current = currentWorkspace();

  return (
    <div class="workspace-switcher" data-workspace-switcher>
      <button
        class="workspace-switcher__trigger"
        onClick={() => setIsOpen(!isOpen())}
        style={{
          display: "flex",
          "align-items": "center",
          gap: "0.75rem",
          padding: "0.5rem 0.75rem",
          border: "1px solid #e5e7eb",
          "border-radius": "0.5rem",
          background: "white",
          cursor: "pointer",
          "font-size": "0.875rem",
          "font-weight": "500",
          color: "#374151",
          transition: "all 0.2s",
          "min-width": "200px",
          "justify-content": "space-between"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#d1d5db";
          e.currentTarget.style.backgroundColor = "#f9fafb";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#e5e7eb";
          e.currentTarget.style.backgroundColor = "white";
        }}
      >
        <div style={{ display: "flex", "align-items": "center", gap: "0.75rem" }}>
          <Show
            when={current?.organization.avatarUrl}
            fallback={
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  "border-radius": "0.25rem",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  "align-items": "center",
                  "justify-content": "center",
                  color: "white",
                  "font-size": "0.75rem",
                  "font-weight": "600"
                }}
              >
                {current ? getInitials(current.organization.name) : "?"}
              </div>
            }
          >
            <img
              src={current?.organization.avatarUrl}
              alt={current?.organization.name}
              style={{
                width: "24px",
                height: "24px",
                "border-radius": "0.25rem",
                "object-fit": "cover"
              }}
            />
          </Show>
          <div style={{ "text-align": "left" }}>
            <div style={{ "font-weight": "600", "line-height": "1.2" }}>
              {current?.workspace.name || "Select Workspace"}
            </div>
            <div style={{ 
              "font-size": "0.75rem", 
              color: "#6b7280", 
              "line-height": "1.2" 
            }}>
              {current?.organization.name}
            </div>
          </div>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          style={{
            transform: isOpen() ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s"
          }}
        >
          <path d="M4.427 9.573l3.396-3.396a.25.25 0 01.354 0l3.396 3.396a.25.25 0 01-.177.427H4.604a.25.25 0 01-.177-.427z" />
        </svg>
      </button>

      <Show when={isOpen()}>
        <div
          class="workspace-switcher__dropdown"
          style={{
            position: "absolute",
            top: "100%",
            left: "0",
            right: "0",
            "margin-top": "0.25rem",
            background: "white",
            border: "1px solid #e5e7eb",
            "border-radius": "0.5rem",
            "box-shadow": "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            "z-index": "50",
            "max-height": "400px",
            overflow: "hidden",
            "min-width": "320px"
          }}
        >
          <div style={{ padding: "0.75rem" }}>
            <input
              type="text"
              placeholder="Search workspaces..."
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                border: "1px solid #e5e7eb",
                "border-radius": "0.375rem",
                "font-size": "0.875rem",
                outline: "none"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#3b82f6";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ "max-height": "300px", "overflow-y": "auto" }}>
            <For each={filteredOrganizations()}>
              {(org) => (
                <div>
                  <div
                    style={{
                      padding: "0.5rem 0.75rem",
                      "font-size": "0.75rem",
                      "font-weight": "600",
                      color: "#6b7280",
                      "text-transform": "uppercase",
                      "letter-spacing": "0.05em",
                      "background-color": "#f9fafb",
                      "border-top": "1px solid #f3f4f6"
                    }}
                  >
                    {org.name}
                    <Show when={org.isPersonal}>
                      <span style={{ "margin-left": "0.5rem", color: "#9ca3af" }}>
                        (Personal)
                      </span>
                    </Show>
                  </div>
                  <For each={org.workspaces}>
                    {(workspace) => (
                      <button
                        class="workspace-option"
                        onClick={() => handleWorkspaceSelect(workspace.slug)}
                        style={{
                          width: "100%",
                          display: "flex",
                          "align-items": "center",
                          gap: "0.75rem",
                          padding: "0.75rem",
                          border: "none",
                          background: workspace.slug === props.currentWorkspaceSlug ? "#f0f9ff" : "transparent",
                          cursor: "pointer",
                          "text-align": "left",
                          "font-size": "0.875rem",
                          transition: "background-color 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          if (workspace.slug !== props.currentWorkspaceSlug) {
                            e.currentTarget.style.backgroundColor = "#f9fafb";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (workspace.slug !== props.currentWorkspaceSlug) {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }
                        }}
                      >
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            "border-radius": "0.25rem",
                            background: workspace.slug === props.currentWorkspaceSlug 
                              ? "#3b82f6" 
                              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            display: "flex",
                            "align-items": "center",
                            "justify-content": "center",
                            color: "white",
                            "font-size": "0.75rem",
                            "font-weight": "600"
                          }}
                        >
                          {getInitials(workspace.name)}
                        </div>
                        <div style={{ flex: "1" }}>
                          <div style={{ "font-weight": "500", "line-height": "1.2" }}>
                            {workspace.name}
                          </div>
                          <div style={{ 
                            "font-size": "0.75rem", 
                            color: "#6b7280", 
                            "line-height": "1.2" 
                          }}>
                            {workspace.role}
                          </div>
                        </div>
                        <Show when={workspace.slug === props.currentWorkspaceSlug}>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            style={{ color: "#3b82f6" }}
                          >
                            <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                          </svg>
                        </Show>
                      </button>
                    )}
                  </For>
                </div>
              )}
            </For>
          </div>

          <div
            style={{
              "border-top": "1px solid #f3f4f6",
              padding: "0.75rem"
            }}
          >
            <button
              style={{
                width: "100%",
                display: "flex",
                "align-items": "center",
                "justify-content": "center",
                gap: "0.5rem",
                padding: "0.5rem",
                border: "1px solid #e5e7eb",
                "border-radius": "0.375rem",
                background: "white",
                cursor: "pointer",
                "font-size": "0.875rem",
                "font-weight": "500",
                color: "#374151",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#d1d5db";
                e.currentTarget.style.backgroundColor = "#f9fafb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.backgroundColor = "white";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" />
              </svg>
              Create workspace
            </button>
          </div>
        </div>
      </Show>
    </div>
  );
}