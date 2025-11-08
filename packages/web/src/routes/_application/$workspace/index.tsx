import { createFileRoute, useRouter } from "@tanstack/solid-router";
import { createSignal, For } from "solid-js";
import { IssueInsert } from "@planar/core/modules/issues/schema";
import { withRpc } from "../../../lib/data/rpc-client";
import { prevented } from "../../../lib/utils";

const getIssues = () => withRpc("get-all-issues")((rpc) => rpc.issues.getAll());
const createIssue = (issue: IssueInsert) =>
  withRpc("create-issue")((rpc) => rpc.issues.create({ payload: issue }));

const NoIssuesFound = <p>No issues found</p>;

function NewIssueForm() {
  const router = useRouter();
  const [title, setTitle] = createSignal("");
  const [description, setDescription] = createSignal("");

  const handleSubmit = async () => {
    await createIssue({ title: title(), description: description() });
    void router.invalidate();
    setTitle("");
    setDescription("");
  };

  return (
    <form onSubmit={prevented(handleSubmit)}>
      <input
        type="text"
        value={title()}
        onInput={(e) => setTitle(e.currentTarget.value)}
        placeholder="Title"
      />
      <input
        type="text"
        value={description()}
        onInput={(e) => setDescription(e.currentTarget.value)}
        placeholder="Description"
      />
      <button type="submit">Create Issue</button>
    </form>
  );
}

export const Route = createFileRoute("/_application/$workspace/")({
  component: WorkspacePage,
  pendingComponent: () => <p>...</p>,
  loader: async () => {
    const issues = await getIssues();

    return { issues };
  },
});

function WorkspacePage() {
  const data = Route.useLoaderData();

  const issues = () => data().issues;

  return (
    <>
      <NewIssueForm />
      <ul style={{ "list-style-type": "none", padding: "0.125rem 0" }}>
        <For each={issues()} fallback={NoIssuesFound}>
          {(issue) => (
            <li style={{ "list-style-type": "none", padding: "0.025rem 0" }}>
              <h3>{issue.title}</h3>
              <p>{issue.description}</p>
            </li>
          )}
        </For>
      </ul>
    </>
  );
}
