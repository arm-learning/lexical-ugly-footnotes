import type {
  DOMConversionMap,
  DOMExportOutput,
  LexicalNodeReplacement,
} from "lexical";
import type { ComponentType } from "react";
import {
  FootnoteLineBreakNode,
  type SerializedFootnoteLineBreakNode,
  registerLineBreakNodeClass,
} from "../nodes/LineBreakNode.client.js";
import { LINE_BREAK_TYPE } from "../shared/constants/line-break.js";
import type { LineBreakComponentProps } from "../types/line-break.js";

export type CustomLineBreakNodeClass = typeof FootnoteLineBreakNode;

let CustomLineBreakNode: CustomLineBreakNodeClass;

export function createCustomLineBreakNode(
  lineBreakComponent: ComponentType<LineBreakComponentProps>,
  options?: CreateDOMCustomizerLineBreakNode,
): [CustomLineBreakNodeClass, LexicalNodeReplacement] {
  CustomLineBreakNode =
    CustomLineBreakNode ||
    generateClass(lineBreakComponent, () => CustomLineBreakNode, options);

  registerLineBreakNodeClass(CustomLineBreakNode);

  return [
    CustomLineBreakNode,
    {
      replace: FootnoteLineBreakNode,
      with: (node: FootnoteLineBreakNode) => {
        return new CustomLineBreakNode();
      },
      withKlass: CustomLineBreakNode,
    },
  ];
}

export type CreateDOMCustomizerLineBreakNode = {
  createDOM?: (node: FootnoteLineBreakNode) => HTMLElement;
  exportDOM?: (node: FootnoteLineBreakNode) => DOMExportOutput;
  importDOM?: (
    NodeClass: CustomLineBreakNodeClass,
  ) => DOMConversionMap<HTMLDivElement> | null;
};

function generateClass(
  lineBreakComponent: ComponentType<LineBreakComponentProps>,
  getNodeClass: () => CustomLineBreakNodeClass,
  options?: CreateDOMCustomizerLineBreakNode,
) {
  return class CustomFootnoteLineBreakNode extends FootnoteLineBreakNode {
    static getType(): string {
      return `custom-${LINE_BREAK_TYPE}`;
    }
    static clone(
      node: CustomFootnoteLineBreakNode,
    ): CustomFootnoteLineBreakNode {
      return new CustomFootnoteLineBreakNode(node.__key);
    }
    static importJSON(
      serializedNode: SerializedFootnoteLineBreakNode,
    ): CustomFootnoteLineBreakNode {
      return new CustomFootnoteLineBreakNode();
    }
    static importDOM(): DOMConversionMap<HTMLDivElement> | null {
      if (options?.importDOM) {
        const NodeClass = getNodeClass();
        return options.importDOM(NodeClass);
      }
      return FootnoteLineBreakNode.importDOM();
    }
    createDOM(): HTMLElement {
      if (options?.createDOM) {
        return options.createDOM(this);
      }
      return super.createDOM();
    }
    exportDOM(): DOMExportOutput {
      if (options?.exportDOM) {
        return options.exportDOM(this);
      }
      return super.exportDOM();
    }
    exportJSON(): SerializedFootnoteLineBreakNode {
      return {
        ...super.exportJSON(),
        type: `custom-${LINE_BREAK_TYPE}`,
      };
    }
    component(): ComponentType<LineBreakComponentProps> | null {
      return lineBreakComponent;
    }
    // decorate(): React.ReactNode {
    //     return super.decorate();
    // }
  };
}
