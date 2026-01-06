"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalNestedComposer } from "@lexical/react/LexicalNestedComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import type { LexicalEditor, NodeKey } from "lexical";
import {
	FootnoteBlockNode,
	FootnoteLineBreakNode,
	FootnotePlugin,
	FootnoteReferenceNode,
	NestedFootnotePlugin,
	SharedHistoryContext,
} from "lexical-ugly-footnotes/client";
import FootnoteButton from "./FootnoteButton.js";
import { $getRoot, $createTextNode, $createParagraphNode } from "lexical";
import { useEffect, useRef } from "react";

interface NestedFootnoteDemoComponentProps {
	nodeKey: NodeKey;
	nestedEditor: LexicalEditor;
	initialContent: string | null;
}

const NestedFootnoteDemoComponent = ({
	nodeKey,
	nestedEditor,
	initialContent,
}: NestedFootnoteDemoComponentProps) => {
	const [editor] = useLexicalComposerContext();
	const [isSelected] = useLexicalNodeSelection(nodeKey);
	const initializedRef = useRef(false);

	// Initialize nested editor content if provided (only once)
	useEffect(() => {
		if (initialContent && !initializedRef.current) {
			nestedEditor.update(() => {
				const root = $getRoot();
				// Only set content if root is empty
				if (root.getChildren().length === 0) {
					const paragraph = $createParagraphNode();
					const text = $createTextNode(initialContent);
					paragraph.append(text);
					root.append(paragraph);
					initializedRef.current = true;
				}
			});
		}
	}, [nestedEditor, initialContent]);

	return (
		<div
			className={`nested-footnote-demo-wrapper border-2 border-dashed border-blue-300 rounded-lg p-4 my-4 bg-blue-50/30 ${
				isSelected ? "ring-2 ring-blue-500" : ""
			}`}
		>
			<div className="mb-2 text-sm font-semibold text-blue-700">
				Nested Footnote Demo
			</div>
			<LexicalNestedComposer initialEditor={nestedEditor}>
				<SharedHistoryContext>
					<div className="flex items-center gap-2 mb-2">
						<FootnoteButton />
						<span className="text-xs text-gray-600">
							Insert footnotes in this nested editor
						</span>
					</div>
					<div className="relative border rounded-md p-4 min-h-[150px] bg-white">
						<RichTextPlugin
							contentEditable={
								<ContentEditable className="outline-none min-h-[100px]" />
							}
							ErrorBoundary={LexicalErrorBoundary}
							placeholder={
								<div className="absolute top-4 left-4 text-gray-400 pointer-events-none text-sm">
									Type here to add nested footnotes...
								</div>
							}
						/>
						<FootnotePlugin />
						<NestedFootnotePlugin editor={editor} nodeKey={nodeKey} />
						<HistoryPlugin />
					</div>
				</SharedHistoryContext>
			</LexicalNestedComposer>
		</div>
	);
};

export default NestedFootnoteDemoComponent;

