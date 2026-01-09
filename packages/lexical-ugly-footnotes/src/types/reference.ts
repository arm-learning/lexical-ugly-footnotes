import type { NodeKey } from "lexical";
import type { ReferenceCssClassNames } from "../theme/index.js";

export interface ReferenceComponentProps {
  referenceId: string | null;
  nodeKey: NodeKey;
  order: number | null;
  classNames: Required<ReferenceCssClassNames>;
}
