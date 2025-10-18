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
