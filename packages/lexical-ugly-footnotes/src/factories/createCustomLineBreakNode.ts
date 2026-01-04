import type { ComponentType } from "react";
import { FootnoteLineBreakNode, registerLineBreakNodeClass, type SerializedFootnoteLineBreakNode } from "../nodes/LineBreakNode.js";
import type { LexicalNodeReplacement } from "lexical";
import { LINE_BREAK_TYPE } from "../constants/line-break.js";
import type { LineBreakComponentProps } from "../types/line-break.js";

export type CustomLineBreakNodeClass = typeof FootnoteLineBreakNode;

let CustomLineBreakNode: CustomLineBreakNodeClass

export function createCustomLineBreakNode(
    lineBreakComponent: ComponentType<LineBreakComponentProps>,
): [CustomLineBreakNodeClass, LexicalNodeReplacement] {
    CustomLineBreakNode = CustomLineBreakNode || generateClass(lineBreakComponent);

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
    ]
}

function generateClass(
    lineBreakComponent: ComponentType<LineBreakComponentProps>,
) {
    console.log("🎉 createCustomLineBreakNode rendered!");
    console.log({lineBreakComponent})
    return class CustomFootnoteLineBreakNode extends FootnoteLineBreakNode {
        static getType(): string {
            return `custom-${LINE_BREAK_TYPE}`;
        }
        static clone(node: CustomFootnoteLineBreakNode): CustomFootnoteLineBreakNode {
            return new CustomFootnoteLineBreakNode(node.__key);
        }
        static importJSON(serializedNode: SerializedFootnoteLineBreakNode): CustomFootnoteLineBreakNode {
            return new CustomFootnoteLineBreakNode();
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
    }
}