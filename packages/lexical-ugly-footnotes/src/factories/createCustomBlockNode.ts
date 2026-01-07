import type { ComponentType } from "react";
import type { LexicalEditor, LexicalNodeReplacement, DOMExportOutput, DOMConversionMap } from "lexical";
import { BLOCK_TYPE } from "../shared/constants/block.js";
import { FootnoteBlockNode, registerBlockNodeClass, type SerializedFootnoteBlockNode } from "../nodes/BlockNode.client.js";
import type { BlockComponentProps } from "../types/block.js";

export type CustomBlockNodeClass = typeof FootnoteBlockNode;

let CustomBlockNode: CustomBlockNodeClass;

export function createCustomBlockNode(
    blockComponent: ComponentType<BlockComponentProps>,
    options?: CreateDOMCustomizer,
): [CustomBlockNodeClass, LexicalNodeReplacement] {
    CustomBlockNode = CustomBlockNode || generateClass(blockComponent, () => CustomBlockNode, options);
    registerBlockNodeClass(CustomBlockNode);
    return [
        CustomBlockNode,
        {
            replace: FootnoteBlockNode,
            with: (node: FootnoteBlockNode) => {
                if (!node.getReferenceId()) {
                    throw new Error("Reference ID is required");
                }
                return new CustomBlockNode(node.getReferenceId() ?? undefined, node.getBlockNote(), node.__key);
            },
            withKlass: CustomBlockNode,
        }
    ]
}

export type CreateDOMCustomizer = {
    createDOM?: (node: FootnoteBlockNode) => HTMLElement;
    exportDOM?: (node: FootnoteBlockNode) => DOMExportOutput;
    importDOM?: (NodeClass: CustomBlockNodeClass) => DOMConversionMap | null;
};

function generateClass(
    blockComponent: ComponentType<BlockComponentProps>,
    getNodeClass: () => CustomBlockNodeClass,
    options?: CreateDOMCustomizer,
) {
    return class CustomFootnoteBlockNode extends FootnoteBlockNode {
        static getType(): string {
            return `custom-${BLOCK_TYPE}`;
        }
        static clone(node: CustomFootnoteBlockNode): CustomFootnoteBlockNode {
            return new CustomFootnoteBlockNode(
                node.__referenceId,
                node.__blockNote,
                node.__key,
            );
        }
        static importJSON(serializedNode: SerializedFootnoteBlockNode): CustomFootnoteBlockNode {
            return new CustomFootnoteBlockNode().updateFromJSON(serializedNode);
        }
        static importDOM(): DOMConversionMap | null {
            if (options?.importDOM) {
                const NodeClass = getNodeClass();
                return options.importDOM(NodeClass);
            }
            return FootnoteBlockNode.importDOM();
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
        exportJSON(): SerializedFootnoteBlockNode {
            return {
                ...super.exportJSON(),
                type: `custom-${BLOCK_TYPE}`,
            };
        }
        component(): ComponentType<BlockComponentProps> | null {
            return blockComponent;
        }
        // decorate(editor: LexicalEditor): React.ReactNode {
        //     return super.decorate(editor);
        // }
    }
}