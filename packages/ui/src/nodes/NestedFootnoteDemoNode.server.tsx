import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { LinkNode } from "@lexical/link";
import { HeadingNode } from "@lexical/rich-text";
import { addClassNamesToElement } from "@lexical/utils";
import type {
  DOMConversionMap,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedEditor,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { $getRoot, DecoratorNode } from "lexical";
import { createEditor } from "lexical";
import { ParagraphNode, TextNode } from "lexical";
import {
  FootnoteBlockNode,
  FootnoteLineBreakNode,
  FootnoteReferenceNode,
} from "lexical-ugly-footnotes/server";

export type SerializedNestedFootnoteDemoNode = Spread<
  {
    nestedEditorState: SerializedEditor;
  },
  SerializedLexicalNode
>;

const NESTED_DEMO_NODE_TYPE = "nested-footnote-demo";

// Create a nested editor for the demo node
const createNestedDemoEditor = () => {
  return createEditor({
    nodes: [
      TextNode,
      ParagraphNode,
      LinkNode,
      HeadingNode,
      FootnoteBlockNode,
      FootnoteReferenceNode,
      FootnoteLineBreakNode,
    ],
    namespace: "nested-footnote-demo-editor",
    theme: {},
  });
};

export class NestedFootnoteDemoNode extends DecoratorNode<null> {
  __nestedEditor: LexicalEditor;
  __initialContent: string | null;

  constructor(
    nestedEditor?: LexicalEditor,
    initialContent?: string | null,
    key?: NodeKey,
  ) {
    super(key);
    this.__nestedEditor = nestedEditor ?? createNestedDemoEditor();
    this.__initialContent = initialContent ?? null;
  }

  static getType(): string {
    return NESTED_DEMO_NODE_TYPE;
  }

  static clone(node: NestedFootnoteDemoNode): NestedFootnoteDemoNode {
    return new NestedFootnoteDemoNode(
      node.__nestedEditor,
      node.__initialContent,
      node.__key,
    );
  }

  getNestedEditor(): LexicalEditor {
    const self = this.getLatest();
    return self.__nestedEditor;
  }

  getInitialContent(): string | null {
    const self = this.getLatest();
    return self.__initialContent;
  }

  setInitialContent(content: string | null): this {
    const self = this.getWritable();
    self.__initialContent = content;
    return self;
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.setAttribute("data-nested-footnote-demo", "true");
    div.classList.add("nested-footnote-demo-container");
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  static importJSON(
    serializedNode: SerializedNestedFootnoteDemoNode,
  ): NestedFootnoteDemoNode {
    const nestedEditor = createNestedDemoEditor();
    const node = new NestedFootnoteDemoNode(nestedEditor);

    if (serializedNode.nestedEditorState) {
      // SerializedEditor has structure { editorState: SerializedEditorState }
      const editorState = nestedEditor.parseEditorState(
        serializedNode.nestedEditorState.editorState,
      );
      if (!editorState.isEmpty()) {
        nestedEditor.setEditorState(editorState);
      }
    }

    return node;
  }

  exportJSON(): SerializedNestedFootnoteDemoNode {
    // Use toJSON() on the editor to get SerializedEditor (which is { editorState: SerializedEditorState })
    const nestedEditorState = this.__nestedEditor.toJSON();
    return {
      ...super.exportJSON(),
      type: NESTED_DEMO_NODE_TYPE,
      nestedEditorState,
    };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: Node) => {
        if (
          domNode instanceof HTMLDivElement &&
          domNode.hasAttribute("data-nested-footnote-demo")
        ) {
          return {
            conversion: () => {
              const nestedEditor = createNestedDemoEditor();
              // Parse content from DOM if needed
              return { node: new NestedFootnoteDemoNode(nestedEditor) };
            },
            priority: 1,
          };
        }
        return null;
      },
    };
  }

  exportDOM(): DOMExportOutput {
    const divRootContainer = document.createElement("div");
    divRootContainer.setAttribute(`data-${NESTED_DEMO_NODE_TYPE}`, "true");
    addClassNamesToElement(
      divRootContainer,
      "border-2 border-dashed border-blue-400 rounded-lg p-4 my-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 shadow-sm",
    );
    const paragraphContainer = document.createElement("div");
    addClassNamesToElement(
      paragraphContainer,
      "relative border-2 border-blue-200 rounded-md p-4 min-h-[150px] bg-white shadow-inner",
    );
    const nestedEditor = this.__nestedEditor;
    nestedEditor.read(() => {
      const html = $generateHtmlFromNodes(nestedEditor, null);
      paragraphContainer.innerHTML = html;
    });
    divRootContainer.appendChild(paragraphContainer);
    return {
      element: divRootContainer,
    };
  }

  decorate(): null {
    return null;
  }
}

export function $createNestedFootnoteDemoNode(
  nestedEditor?: LexicalEditor,
  initialContent?: string | null,
): NestedFootnoteDemoNode {
  return new NestedFootnoteDemoNode(nestedEditor, initialContent);
}

export function $isNestedFootnoteDemoNode(
  node: LexicalNode | null,
): node is NestedFootnoteDemoNode {
  return node instanceof NestedFootnoteDemoNode;
}
