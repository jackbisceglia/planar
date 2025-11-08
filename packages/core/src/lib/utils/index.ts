import { TaggedError } from "../effect/error";

/**
 * iife helper - invokes a function immediately and returns its result
 *
 * @param fn - The function to invoke
 * @returns The result of the function
 * @example
 * const callback = invoke(() => {
 *   const host = getHeader("host");
 *   return `${host?.includes("localhost") ? "http" : "https"}://${host}/api/callback`;
 * });
 */
export function invoke<T>(fn: () => T): T {
  return fn();
}

export const buildUrlWithPortOptional = (
  url: string,
  port: number | undefined,
) => {
  if (!port) return url;

  return `${url}:${port.toString()}`;
};

export type NonNullableNested<
  T,
  K1 extends keyof T,
  K2 extends keyof NonNullable<T[K1]>,
> = T & {
  [P1 in K1]: NonNullable<T[P1]> & {
    [P2 in K2]: NonNullable<NonNullable<T[P1]>[P2]>;
  };
};

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AsyncReturn<T extends (...args: any) => any> = Awaited<
  ReturnType<T>
>;

export class UnknownError extends TaggedError("UnknownError") {}
