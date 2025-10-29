import { createSignal, For, Show } from "solid-js";
import { useNavigate } from "@tanstack/solid-router";
import { auth } from "../auth/better-auth-client";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

interface WorkspaceSwitcherProps {
  currentSlug: string;
}

export function WorkspaceSwitcher(props: WorkspaceSwitcherProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = createSignal(false);
  const [organizations, setOrganizations] = createSignal<Organization[]>([]);
  const [loading, setLoading] = createSignal(false);

  const currentOrg = () => 
    organizations().find((org) => org.slug === props.currentSlug);

  const loadOrganizations = async () => {
    if (organizations().length > 0) return;
    
    setLoading(true);
    try {
      const result = await auth.organization.listOrganizations();
      console.log("LOADED ORGANIZATIONS", JSON.stringify(result, null, 2));
      setOrganizations(result.data || []);
    } catch (error) {
      console.log("ERROR LOADING ORGANIZATIONS", JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async () => {
    setIsOpen(true);
    await loadOrganizations();
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSwitch = async (org: Organization) => {
    try {
      await auth.organization.setActive({
        organizationId: org.id,
      });
      void navigate({
        to: "/$workspace",
        params: { workspace: org.slug },
      });
      setIsOpen(false);
    } catch (error) {
      console.log("ERROR SWITCHING WORKSPACE", JSON.stringify(error, null, 2));
    }
  };

  const handleCreateNew = () => {
    void navigate({ to: "/select-workspace" });
    setIsOpen(false);
  };

  return (
    <div style="position: relative;">
      {/* Trigger Button */}
      <button
        onClick={handleOpen}
        style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; color: #ffffff; cursor: pointer; transition: all 0.2s; font-size: 14px; font-weight: 600;"
        onmouseover={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
        }}
        onmouseout={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
        }}
      >
        <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 12px;">
          {currentOrg()?.name.charAt(0).toUpperCase() || props.currentSlug.charAt(0).toUpperCase()}
        </div>
        <span>{currentOrg()?.name || props.currentSlug}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          style="margin-left: 4px;"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <Show when={isOpen()}>
        <div
          style="position: fixed; inset: 0; z-index: 40;"
          onClick={handleClose}
        />
        <div
          style="position: absolute; top: calc(100% + 8px); left: 0; z-index: 50; min-width: 280px; background: #1a1a1a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5); padding: 8px; max-height: 400px; overflow-y: auto;"
        >
          <div style="padding: 8px 12px; margin-bottom: 4px;">
            <div style="font-size: 12px; font-weight: 600; color: #a0a0a0; text-transform: uppercase; letter-spacing: 0.5px;">
              Workspaces
            </div>
          </div>

          <Show when={loading()}>
            <div style="padding: 16px; text-align: center; color: #a0a0a0; font-size: 14px;">
              Loading...
            </div>
          </Show>

          <Show when={!loading()}>
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <For each={organizations()}>
                {(org) => (
                  <button
                    onClick={() => void handleSwitch(org)}
                    style={{
                      display: "flex",
                      "align-items": "center",
                      gap: "12px",
                      padding: "10px 12px",
                      background: org.slug === props.currentSlug ? "rgba(255, 255, 255, 0.1)" : "transparent",
                      border: "none",
                      "border-radius": "6px",
                      color: "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      "text-align": "left",
                      width: "100%",
                    }}
                    onmouseover={(e) => {
                      if (org.slug !== props.currentSlug) {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                      }
                    }}
                    onmouseout={(e) => {
                      if (org.slug !== props.currentSlug) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; flex-shrink: 0;">
                      {org.name.charAt(0).toUpperCase()}
                    </div>
                    <div style="flex: 1; min-width: 0;">
                      <div style="font-weight: 600; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        {org.name}
                      </div>
                      <div style="color: #a0a0a0; font-size: 12px;">
                        /{org.slug}
                      </div>
                    </div>
                    <Show when={org.slug === props.currentSlug}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M13.3333 4L6 11.3333L2.66667 8"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </Show>
                  </button>
                )}
              </For>
            </div>

            <div style="height: 1px; background: rgba(255, 255, 255, 0.1); margin: 8px 0;" />

            <button
              onClick={handleCreateNew}
              style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: transparent; border: none; border-radius: 6px; color: #ffffff; cursor: pointer; transition: all 0.15s; text-align: left; width: 100%; font-weight: 600; font-size: 14px;"
              onmouseover={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              }}
              onmouseout={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <div style="width: 32px; height: 32px; background: rgba(255, 255, 255, 0.1); border: 1px dashed rgba(255, 255, 255, 0.3); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 16px;">
                +
              </div>
              <span>Create workspace</span>
            </button>
          </Show>
        </div>
      </Show>
    </div>
  );
}
