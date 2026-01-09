import type { DOMConversionMap, NodeKey } from "lexical";
import { REFERENCE_ATTR } from "../shared/constants/reference.js";
import {
  FootnoteReferenceBase,
  type SerializedFootnoteReferenceNode,
  createConvertFootnoteReferenceElement,
} from "../shared/nodes/Reference.base.js";

// Re-export types from base
export type { SerializedFootnoteReferenceNode } from "../shared/nodes/Reference.base.js";

// ============================================================================
// Server Node Class
// ============================================================================

export class FootnoteReferenceNode extends FootnoteReferenceBase<null> {
  constructor(
    referenceId?: string | null,
    order?: number | null,
    key?: NodeKey,
  ) {
    super(referenceId, order, key);
  }

  static clone(node: FootnoteReferenceNode): FootnoteReferenceNode {
    return new FootnoteReferenceNode(
      node.getReferenceId(),
      node.getOrder(),
      node.getKey(),
    );
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: Node) => {
        if (
          domNode instanceof HTMLSpanElement &&
          domNode.hasAttribute(REFERENCE_ATTR.container)
        ) {
          return {
            conversion: convertFootnoteReferenceElement,
            priority: 1,
          };
        }
        return null;
      },
    };
  }

  static importJSON(
    serializedNode: SerializedFootnoteReferenceNode,
  ): FootnoteReferenceNode {
    return $createFootnoteReferenceNode().updateFromJSON(serializedNode);
  }

  decorate(): null {
    return null;
  }
}

// ============================================================================
// Server-specific helpers
// ============================================================================

export const convertFootnoteReferenceElement =
  createConvertFootnoteReferenceElement(() => $createFootnoteReferenceNode());

export const $createFootnoteReferenceNode = (
  referenceId?: string | null,
  order?: number | null,
  key?: NodeKey,
): FootnoteReferenceNode => {
  const node = new FootnoteReferenceNode(referenceId, order, key);
  if (referenceId) {
    node.setReferenceId(referenceId);
  }
  if (typeof order === "number") {
    node.setOrder(order);
  }
  return node;
};

// Re-export $isFootnoteReferenceNode from base
export { $isFootnoteReferenceNode } from "../shared/nodes/Reference.base.js";
