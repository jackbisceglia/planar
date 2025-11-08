import { Array, Exit } from "effect";

export function requireValueNonNullishExit<T, R>(
  handle: R,
): (data: T | null) => Exit.Exit<T, R> {
  return function (data) {
    if (data === null || data === undefined) {
      return Exit.fail(handle);
    }

    return Exit.succeed(data);
  };
}

export function requireValueNonEmptyExit<T, R>(
  handle: R,
): (data: T[]) => Exit.Exit<Array.NonEmptyArray<T>, R> {
  return function (data) {
    if (!Array.isNonEmptyArray(data)) {
      return Exit.fail(handle);
    }

    return Exit.succeed(data);
  };
}
