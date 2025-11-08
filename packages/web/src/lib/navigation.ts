import {
  redirect,
  RegisteredRouter,
  ValidateRedirectOptions,
} from "@tanstack/solid-router";

export const safeThrowRedirect = <
  TRouter extends RegisteredRouter = RegisteredRouter,
  TOptions = unknown,
>(
  options: ValidateRedirectOptions<TRouter, TOptions>,
  domain: string,
): never => {
  redirect({ ...options, throw: true });

  // this should never occur, just to terminate the codepath in favor of throw param ^
  throw new Error(`Unknown ${domain} Error Occurred`);
};
