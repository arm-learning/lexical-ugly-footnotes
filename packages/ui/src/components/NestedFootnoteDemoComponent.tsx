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
	NestedFootnotePlugin,
	SharedHistoryContext,
} from "lexical-ugly-footnotes/client";
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
			className={`nested-footnote-demo-wrapper border-2 border-dashed border-blue-400 rounded-lg p-4 my-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 shadow-sm ${
				isSelected ? "ring-2 ring-blue-500 border-blue-500" : ""
			}`}
		>
			<div className="mb-3 flex items-center gap-2">
				<div className="text-sm font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded">
					Nested Footnote Demo
				</div>
				<div className="h-px flex-1 bg-blue-200"></div>
			</div>
			<LexicalNestedComposer initialEditor={nestedEditor}>
				<SharedHistoryContext>
					<div className="relative border-2 border-blue-200 rounded-md p-4 min-h-[150px] bg-white shadow-inner">
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
						<NestedFootnotePlugin editor={editor} nodeKey={nodeKey} />
						<HistoryPlugin />
					</div>
				</SharedHistoryContext>
			</LexicalNestedComposer>
		</div>
	);
};

export default NestedFootnoteDemoComponent;

