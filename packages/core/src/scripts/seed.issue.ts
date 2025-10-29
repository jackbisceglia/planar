import { Effect } from "effect";
import { Issues } from "../modules/issues/entity";
import { IssueInsert } from "../modules/issues/schema";
import { RuntimeCli } from "./cli-runtime";

const mocks = [
  {
    title: "title 1",
    description: "description 1",
    workspace_id: "placeholder-workspace-id", // TODO: Use actual workspace ID
  },
  {
    title: "title 2",
    description: "description 2",
    workspace_id: "placeholder-workspace-id", // TODO: Use actual workspace ID
  },
  {
    title: "title 3",
    description: "description 3",
    workspace_id: "placeholder-workspace-id", // TODO: Use actual workspace ID
  },
] satisfies IssueInsert[];

const setup = Effect.fn(function* () {
  const entity = yield* Issues;

  yield* entity.removeAll();
});

const main = Effect.fn("issue.seed")(function* (issues: IssueInsert[]) {
  const entity = yield* Issues;

  yield* setup();

  const results = yield* Effect.forEach(issues, (issue) =>
    entity.create(issue),
  );

  return results;
});

const Program = main(mocks);

void RuntimeCli.runPromise(Program).then(RuntimeCli.dispose);
