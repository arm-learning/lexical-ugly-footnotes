import type { ComponentType } from "react";
import { FootnoteReferenceNode, registerReferenceNodeClass, type SerializedFootnoteReferenceNode } from "../nodes/ReferenceNode.client.js";
import type { ReferenceComponentProps } from "../types/reference.js";
import type { LexicalEditor, LexicalNodeReplacement, DOMExportOutput, DOMConversionMap } from "lexical";
import { REFERENCE_TYPE } from "../shared/constants/reference.js";

export type CustomReferenceNodeClass = typeof FootnoteReferenceNode;

let CustomReferenceNode: CustomReferenceNodeClass;

export function createCustomReferenceNode(
    referenceComponent: ComponentType<ReferenceComponentProps>,
    options?: CreateDOMCustomizer,
): [CustomReferenceNodeClass, LexicalNodeReplacement] {
    CustomReferenceNode = CustomReferenceNode || generateClass(referenceComponent, () => CustomReferenceNode, options);
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

export type CreateDOMCustomizer = {
    createDOM?: (node: FootnoteReferenceNode) => HTMLElement;
    exportDOM?: (node: FootnoteReferenceNode) => DOMExportOutput;
    importDOM?: (NodeClass: CustomReferenceNodeClass) => DOMConversionMap | null;
};

function generateClass(
    referenceComponent: ComponentType<ReferenceComponentProps>,
    getNodeClass: () => CustomReferenceNodeClass,
    options?: CreateDOMCustomizer,
) {
    return class CustomFootnoteReferenceNode extends FootnoteReferenceNode {
        static getType(): string {
            return `custom-${REFERENCE_TYPE}`;
        }
        static clone(node: CustomFootnoteReferenceNode): CustomFootnoteReferenceNode {
            return new CustomFootnoteReferenceNode(
                node.getReferenceId(),
                node.getOrder(),
                node.__key
            );
        }
        static importJSON(serializedNode: SerializedFootnoteReferenceNode): CustomFootnoteReferenceNode {
            return new CustomFootnoteReferenceNode();
        }
        static importDOM(): DOMConversionMap | null {
            if (options?.importDOM) {
                const NodeClass = getNodeClass();
                return options.importDOM(NodeClass);
            }
            return FootnoteReferenceNode.importDOM();
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