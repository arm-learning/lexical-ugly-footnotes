import type { NodeKey } from "lexical";
import type { LineBreakCssClassNames } from "../theme/index.js";

export interface LineBreakComponentProps {
  nodeKey: NodeKey;
  classNames: Required<LineBreakCssClassNames>;
}
