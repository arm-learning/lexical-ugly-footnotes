import type { ComponentType } from "react";
import type { LexicalEditor, LexicalNodeReplacement } from "lexical";
import { BLOCK_TYPE } from "../shared/constants/block.js";
import { FootnoteBlockNode, registerBlockNodeClass, type SerializedFootnoteBlockNode } from "../nodes/BlockNode.client.js";
import type { BlockComponentProps } from "../types/block.js";

export type CustomBlockNodeClass = typeof FootnoteBlockNode;

let CustomBlockNode: CustomBlockNodeClass;

export function createCustomBlockNode(
    blockComponent: ComponentType<BlockComponentProps>,
): [CustomBlockNodeClass, LexicalNodeReplacement] {
    CustomBlockNode = CustomBlockNode || generateClass(blockComponent);
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

function generateClass(
    blockComponent: ComponentType<BlockComponentProps>,
) {
    return class CustomFootnoteBlockNode extends FootnoteBlockNode {
        static getType(): string {
            return `custom-${BLOCK_TYPE}`;
        }
        static clone(node: CustomFootnoteBlockNode): CustomFootnoteBlockNode {
            return new CustomFootnoteBlockNode(node.__key);
        }
        static importJSON(serializedNode: SerializedFootnoteBlockNode): CustomFootnoteBlockNode {
            return new CustomFootnoteBlockNode();
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