import { TaggedError } from "@planar/core/lib/effect/error";

export class InvalidWorkspaceError extends TaggedError(
  "InvalidWorkspaceError",
) {}
