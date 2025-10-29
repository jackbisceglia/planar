import { cn } from "../utils/index";
import { PropsWithClass } from "../utils/solid";

export function Logo(props: PropsWithClass) {
  return <span class={cn("text-secondary", props.class)}>⬗</span>;
}
