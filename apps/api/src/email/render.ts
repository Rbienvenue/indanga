import { render } from "@react-email/render";
import type { ComponentType } from "react";
import React from "react";

export async function renderToString<P>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: ComponentType<P>,
  props: P,
): Promise<string> {
  return await render(React.createElement(Component as ComponentType<never>, props as never));
}
