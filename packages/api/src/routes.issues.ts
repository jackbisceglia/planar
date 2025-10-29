import { HttpApiBuilder } from "@effect/platform";
import { Api } from "@planar/core/lib/contracts/index";
import { Effect } from "effect";
import { toInternalServerError } from "./errors";
import { Issues } from "@planar/core/modules/issues/entity";
// TODO: Re-enable organization service after fixing type issues
// import { OrganizationService } from "@planar/core/modules/organizations/entity";

export const IssuesGroupLive = HttpApiBuilder.group(
  Api,
  "issues",
  Effect.fn(function* (handlers) {
    const entity = yield* Issues;
    // TODO: Re-enable organization service after fixing type issues
    // const orgService = yield* OrganizationService;

    return handlers
      .handle("get", ({ path: { workspaceId, issueId } }) =>
        Effect.gen(function* () {
          // TODO: Get user from session and check workspace access
          // const userId = "temp-user-id";
          // const access = yield* orgService.getUserWorkspaceAccess(userId, workspaceId);
          
          // if (!access) {
          //   return yield* Effect.fail(HttpApiError.Unauthorized());
          // }

          // For now, just get the issue without workspace access checks
          console.log("WORKSPACE_ID", workspaceId); // Debug log

          return yield* entity.get(issueId).pipe(
            Effect.catchTags({
              SqlError: toInternalServerError,
              IssueNotFoundError: () => Effect.succeed(null),
            }),
          );
        })
      )
      .handle("getAll", ({ path: { workspaceId } }) =>
        Effect.gen(function* () {
          // TODO: Get user from session and check workspace access
          // const userId = "temp-user-id";
          // const access = yield* orgService.getUserWorkspaceAccess(userId, workspaceId);
          
          // if (!access) {
          //   return yield* Effect.fail(HttpApiError.Unauthorized());
          // }

          // For now, just get all issues for the workspace without access checks
          console.log("WORKSPACE_ID", workspaceId); // Debug log

          return yield* entity
            .getAllByWorkspace(workspaceId)
            .pipe(Effect.catchTags({ SqlError: toInternalServerError }));
        })
      )
      .handle("create", ({ path: { workspaceId }, payload }) =>
        Effect.gen(function* () {
          // TODO: Get user from session and check workspace access
          // const userId = "temp-user-id";
          // const access = yield* orgService.getUserWorkspaceAccess(userId, workspaceId);
          
          // if (!access) {
          //   return yield* Effect.fail(HttpApiError.Unauthorized());
          // }

          // For now, just create the issue without access checks
          console.log("WORKSPACE_ID", workspaceId); // Debug log

          return yield* entity
            .create({ ...payload, workspace_id: workspaceId })
            .pipe(Effect.catchTags({ SqlError: toInternalServerError }));
        })
      )
      .handle("update", ({ path: { workspaceId, issueId }, payload }) =>
        Effect.gen(function* () {
          // TODO: Get user from session and check workspace access
          // const userId = "temp-user-id";
          // const access = yield* orgService.getUserWorkspaceAccess(userId, workspaceId);
          
          // if (!access) {
          //   return yield* Effect.fail(HttpApiError.Unauthorized());
          // }

          // For now, just update the issue without access checks
          console.log("WORKSPACE_ID", workspaceId); // Debug log

          return yield* entity
            .update(issueId, payload as any) // TODO: Fix type issue with partial payload
            .pipe(Effect.catchTags({ 
              SqlError: toInternalServerError,
              IssueNotFoundError: toInternalServerError,
            }));
        })
      )
      .handle("delete", ({ path: { workspaceId, issueId } }) =>
        Effect.gen(function* () {
          // TODO: Get user from session and check workspace access
          // const userId = "temp-user-id";
          // const access = yield* orgService.getUserWorkspaceAccess(userId, workspaceId);
          
          // if (!access) {
          //   return yield* Effect.fail(HttpApiError.Unauthorized());
          // }

          // For now, just delete the issue without access checks
          console.log("WORKSPACE_ID", workspaceId); // Debug log

          yield* entity
            .delete(issueId)
            .pipe(Effect.catchTags({ 
              SqlError: toInternalServerError,
              IssueNotFoundError: toInternalServerError,
            }));

          return { success: true };
        })
      );
  }),
);
