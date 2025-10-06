import { Cause, Data } from "effect";

/**
 * Creates a tagged error class with a specific name and error structure.
 * @template T - The string literal type for the error name
 * @param name - The name of the error class
 * @returns A class that extends Data.TaggedError with the specified name
 */
export function TaggedError(name: string) {
  type E = {
    message: string;
    cause?: unknown;
  };

  const NewClass = class extends Data.TaggedError(name)<E> {
    constructor(message: string, cause?: unknown) {
      super({ message, cause });
    }
  };

  return NewClass as unknown as new <
    A extends Record<string, unknown> = Record<string, unknown>,
  >(
    message: string,
    cause?: unknown,
  ) => Cause.YieldableError & { readonly _tag: string } & Readonly<A>;
}
