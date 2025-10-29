import { ensureTaggedError, UIErrorTag } from "@planar/core/lib/effect/error";
import { Prettify } from "@planar/core/lib/utils/index";
import { ParentProps, ComponentProps, Match } from "solid-js";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type PropsWithClass<TProps = {}> = Prettify<TProps & { class?: string }>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type ParentPropsWithClass<TProps = {}> = Prettify<
  ParentProps<PropsWithClass<TProps>>
>;

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
