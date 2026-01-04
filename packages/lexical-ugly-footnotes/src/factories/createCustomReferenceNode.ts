import type { ComponentType } from "react";
import { FootnoteReferenceNode, registerReferenceNodeClass, type SerializedFootnoteReferenceNode } from "../nodes/ReferenceNode.js";
import type { ReferenceComponentProps } from "../types/reference.js";
import type { LexicalEditor, LexicalNodeReplacement } from "lexical";
import { REFERENCE_TYPE } from "../constants/reference.js";

export type CustomReferenceNodeClass = typeof FootnoteReferenceNode;

let CustomReferenceNode: CustomReferenceNodeClass;

export function createCustomReferenceNode(
    referenceComponent: ComponentType<ReferenceComponentProps>,
): [CustomReferenceNodeClass, LexicalNodeReplacement] {
    CustomReferenceNode = CustomReferenceNode || generateClass(referenceComponent);
    registerReferenceNodeClass(CustomReferenceNode);
    return [
        CustomReferenceNode,
        {
            replace: FootnoteReferenceNode,
            with: (node: FootnoteReferenceNode) => {
                return new CustomReferenceNode(node.getReferenceId(), node.getOrder(), node.__key);
            },
            withKlass: CustomReferenceNode,
        },
    ]
}

function generateClass(
    referenceComponent: ComponentType<ReferenceComponentProps>,
) {
    return class CustomFootnoteReferenceNode extends FootnoteReferenceNode {
        static getType(): string {
            return `custom-${REFERENCE_TYPE}`;
        }
        static clone(node: CustomFootnoteReferenceNode): CustomFootnoteReferenceNode {
            return new CustomFootnoteReferenceNode(node.__key,
                node.__order,
                node.__key
            );
        }
        static importJSON(serializedNode: SerializedFootnoteReferenceNode): CustomFootnoteReferenceNode {
            return new CustomFootnoteReferenceNode();
        }
        exportJSON(): SerializedFootnoteReferenceNode {
            return {
                ...super.exportJSON(),
                type: `custom-${REFERENCE_TYPE}`,
            };
        }
        component(): ComponentType<ReferenceComponentProps> | null {
            return referenceComponent;
        }
        // decorate(editor: LexicalEditor): React.ReactNode {
        //     return super.decorate(editor);
        // }
    }
}