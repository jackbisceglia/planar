import { createFileRoute, useRouter } from "@tanstack/solid-router";
import { createSignal, For } from "solid-js";
import { IssueInsert } from "@planar/core/modules/issues/schema";
import { withRpc } from "../../../lib/data/rpc-client";
import { prevented } from "../../../lib/utils";
import { auth } from "../../../lib/auth/better-auth-client";

const getIssues = (organizationId: string) => 
  withRpc("get-all-issues")((rpc) => 
    rpc.issues.getAll({ payload: { organizationId } })
  );

const createIssue = (issue: IssueInsert) =>
  withRpc("create-issue")((rpc) => rpc.issues.create({ payload: issue }));

const NoIssuesFound = (
  <div style="text-align: center; padding: 48px; color: #a0a0a0;">
    <p style="font-size: 16px; margin-bottom: 8px;">No issues yet</p>
    <p style="font-size: 14px;">Create your first issue to get started</p>
  </div>
);

function NewIssueForm(props: { organizationId: string }) {
  const router = useRouter();
  const [title, setTitle] = createSignal("");
  const [description, setDescription] = createSignal("");

  const handleSubmit = async () => {
    await createIssue({ 
      title: title(), 
      description: description(),
      organizationId: props.organizationId,
    });
    void router.invalidate();
    setTitle("");
    setDescription("");
  };

  return (
    <form 
      onSubmit={prevented(handleSubmit)}
      style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 24px; margin-bottom: 24px;"
    >
      <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 18px; font-weight: 600;">
        Create new issue
      </h3>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <input
          type="text"
          value={title()}
          onInput={(e) => setTitle(e.currentTarget.value)}
          placeholder="Title"
          required
          style="padding: 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; color: #ffffff; font-size: 16px;"
        />
        <textarea
          value={description()}
          onInput={(e) => setDescription(e.currentTarget.value)}
          placeholder="Description"
          required
          rows="3"
          style="padding: 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; color: #ffffff; font-size: 16px; resize: vertical;"
        />
        <button 
          type="submit"
          style="padding: 12px; background: #ffffff; color: #000000; border: none; border-radius: 6px; font-weight: 600; font-size: 16px; cursor: pointer; transition: all 0.2s;"
          onmouseover={(e) => {
            e.currentTarget.style.background = "#f0f0f0";
          }}
          onmouseout={(e) => {
            e.currentTarget.style.background = "#ffffff";
          }}
        >
          Create Issue
        </button>
      </div>
    </form>
  );
}

export const Route = createFileRoute("/_application/$workspace/")({
  component: WorkspacePage,
  loader: async ({ params }) => {
    // Get the active organization from the session
    const session = await auth.getSession();
    const activeOrgId = session.data?.session?.activeOrganizationId;
    
    console.log("LOADING ISSUES", JSON.stringify({ params, activeOrgId }, null, 2));
    
    if (!activeOrgId) {
      return { issues: [], organizationId: null };
    }

    const issues = await getIssues(activeOrgId);

    return { issues, organizationId: activeOrgId };
  },
});

function WorkspacePage() {
  const data = Route.useLoaderData();

  return (
    <>
      <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 24px; letter-spacing: -0.5px;">
        Issues
      </h2>
      
      {data().organizationId && (
        <NewIssueForm organizationId={data().organizationId!} />
      )}
      
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <For each={data().issues} fallback={NoIssuesFound}>
          {(issue) => (
            <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 20px; transition: all 0.2s;">
              <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 16px; font-weight: 600;">
                {issue.title}
              </h3>
              <p style="margin: 0; color: #a0a0a0; font-size: 14px; line-height: 1.5;">
                {issue.description}
              </p>
            </div>
          )}
        </For>
      </div>
    </>
  );
}
