import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { WebUrl } from "@planar/core/lib/config/web";
import { RuntimeClient } from "../setup/client-runtime";
import { ApiUrl } from "@planar/core/lib/config/api";
import { Effect, pipe, Schema, String, Array } from "effect";

const [web, api] = await RuntimeClient.runPromise(Effect.all([WebUrl, ApiUrl]));

export const webBaseUrl = web;
export const apiBaseUrl = api;

export const prevented = <
  E extends { preventDefault: () => void; stopPropagation: () => void },
>(
  callback?: (e: E) => unknown,
) => {
  return (e: E) => {
    e.preventDefault();
    e.stopPropagation();
    callback?.(e);
  };
};

function capitalizePhrase(phrase: string) {
  return pipe(
    phrase,
    String.split(" "),
    Array.map(String.capitalize),
    Array.join(" "),
  );
}

//
/**
 * Workspace schema (String -> String) for roundtripping between a human-readable
 * name and a URL-safe slug in a non-lossy way.
 *
 * Non-lossy mapping:
 * - encode: replace all spaces with `-`
 * - decode: replace all `-` with spaces
 *
 * Assumptions (required for non-lossy roundtrip):
 * - Input names contain no `-` characters (use spaces as separators)
 * - Input slugs contain no spaces
 * - No implicit trimming or case normalization is performed
 *
 * Invariants under these assumptions:
 * - decode(encode(name)) === name
 * - encode(decode(slug)) === slug
 */
export const Workspace = Schema.transform(Schema.String, Schema.String, {
  decode: (slug) => slug.replace(/-/g, " "),
  encode: (phrase) => phrase.replace(/ /g, "-"),
});

export const slugify = {
  decode: Workspace.pipe(Schema.decodeSync),
  encode: Workspace.pipe(Schema.encodeSync),
  // utils
  decodeCapitalized: function (slug: string) {
    return pipe(slug, this.decode, capitalizePhrase);
  },
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
