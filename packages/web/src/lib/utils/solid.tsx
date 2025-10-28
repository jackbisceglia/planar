import { ensureTaggedError, UIErrorTag } from "@planar/core/lib/effect/error";
import { ParentProps, ComponentProps, Match } from "solid-js";

type MatchTagProps = ParentProps<{
  tag: UIErrorTag;
  error: ReturnType<typeof ensureTaggedError>;
  children: ComponentProps<typeof Match>["children"];
}>;

export function MatchTag(props: MatchTagProps) {
  return (
    <Match children={props.children} when={props.error._tag === props.tag} />
  );
}
