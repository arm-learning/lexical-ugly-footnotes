import type { DOMConversionMap, DOMConversionOutput, NodeKey } from "lexical";
import { LINE_BREAK_ATTR } from "../shared/constants/line-break.js";
import {
  FootnoteLineBreakBase,
  type SerializedFootnoteLineBreakNode,
  createConvertFootnoteLineBreakNode,
} from "../shared/nodes/LineBreak.base.js";

// Re-export types from base
export type {
  FootnoteLineBreakNodeProps,
  SerializedFootnoteLineBreakNode,
} from "../shared/nodes/LineBreak.base.js";

// ============================================================================
// Server Node Class
// ============================================================================

export class FootnoteLineBreakNode extends FootnoteLineBreakBase<null> {
  constructor(key?: NodeKey) {
    super(key);
  }

  static clone(node: FootnoteLineBreakNode): FootnoteLineBreakNode {
    return new FootnoteLineBreakNode(node.__key);
  }

  static importDOM(): DOMConversionMap<HTMLDivElement> | null {
    return {
      div: (domNode: HTMLDivElement) => {
        if (!domNode.hasAttribute(LINE_BREAK_ATTR.container)) return null;
        return {
          conversion: convertFootnoteLineBreakNode,
          priority: 2,
        };
      },
    };
  }

  static importJSON(
    json: SerializedFootnoteLineBreakNode,
  ): FootnoteLineBreakNode {
    return $createFootnoteLineBreakNode().updateFromJSON(json);
  }

  decorate(): null {
    return null;
  }
}

// ============================================================================
// Server-specific helpers
// ============================================================================

export const convertFootnoteLineBreakNode = createConvertFootnoteLineBreakNode(
  () => $createFootnoteLineBreakNode(),
);

export const $createFootnoteLineBreakNode = (): FootnoteLineBreakNode => {
  return new FootnoteLineBreakNode();
};

// Re-export $isFootnoteLineBreakNode from base
export { $isFootnoteLineBreakNode } from "../shared/nodes/LineBreak.base.js";
