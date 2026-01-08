"use client";
import {
	LexicalComposer,
	type InitialConfigType,
} from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import {
	FootnoteBlockNode,
	FootnoteLineBreakNode,
	FootnotePlugin,
	FootnoteReferenceNode,
	SharedHistoryContext,
} from "lexical-ugly-footnotes/client";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import FootnoteButton from "./components/FootnoteButton.js";
import NestedEditorButton from "./components/NestedEditorButton.js";
import { useRef } from "react";
import { $createTextNode, $getRoot, $createParagraphNode, type LexicalEditor } from "lexical";
import { $createHeadingNode, HeadingNode } from "@lexical/rich-text";
import { $generateNodesFromDOM } from "@lexical/html";
import {
	$createNestedFootnoteDemoNode,
	NestedFootnoteDemoNode,
} from "./nodes/NestedFootnoteDemoNode.js";

interface EditorShowcaseNestedProps {
	submitHandler: (editor: LexicalEditor) => void;
	content: string | null;
}

const theme = {
	// Default theme - no custom styling
};

function onError(error: Error) {
	console.error(error);
}

export const EditorShowcaseNested = ({
	submitHandler,
	content,
}: EditorShowcaseNestedProps) => {
	const editorRef = useRef<LexicalEditor | null>(null);
	const initialConfig = {
		namespace: "Showcase-Nested",
		theme,
		onError,
		nodes: [
			HeadingNode,
			FootnoteBlockNode,
			FootnoteReferenceNode,
			FootnoteLineBreakNode,
			NestedFootnoteDemoNode,
		],
		editorState: (editor) => {
			if (content && content[0] === "<") {
				const dom = new DOMParser();
				const document = dom.parseFromString(content, "text/html");
				const nodes = $generateNodesFromDOM(editor, document);
				const root = $getRoot();
				root.clear();
				for (const node of nodes) {
					root.append(node);
				}
				return;
			}

			if (content) {
				const editorState = editor.parseEditorState(content);
				if (editorState.isEmpty()) {
					return;
				}
				return editor.setEditorState(editorState);
			}

			// Default content with nested footnote demo node
			const root = $getRoot();
			root.clear();

			// Add a heading
			const title = $createHeadingNode("h1");
			const titleText = $createTextNode("Nested Footnotes Demo");
			title.append(titleText);
			root.append(title);

			// Add a paragraph before the demo
			const para1 = $createHeadingNode("h2");
			const para1Text = $createTextNode("Main Content");
			para1.append(para1Text);
			root.append(para1);

			const para2 = $createParagraphNode();
			const para2Text = $createTextNode(
				"This is the main editor. You can insert footnotes here, and they will appear at the bottom. " +
					"Below is a nested editor demo block where you can create footnotes within footnotes."
			);
			para2.append(para2Text);
			root.append(para2);

			// Add the nested footnote demo node with sample content
			const demoNode = $createNestedFootnoteDemoNode(
				undefined,
				"This is a nested editor. You can insert footnotes here using the button above, and they will be nested within this block. Try adding a footnote!"
			);
			root.append(demoNode);

			// Add more content after
			const para3 = $createParagraphNode();
			const para3Text = $createTextNode(
				"You can continue editing the main content here, and insert more footnotes or nested demo blocks."
			);
			para3.append(para3Text);
			root.append(para3);
		},
	} satisfies InitialConfigType;

	return (
		<div className="showcase-editor-nested">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					if (editorRef.current) {
						submitHandler(editorRef.current);
					}
				}}
			>
				<LexicalComposer initialConfig={initialConfig}>
					<SharedHistoryContext>
						<div className="flex items-center gap-2 mb-2">
							<FootnoteButton />
							<NestedEditorButton />
						</div>
						<div className="relative border rounded-md p-4 min-h-[200px]">
							<RichTextPlugin
								contentEditable={
									<ContentEditable className="outline-none min-h-[150px]" />
								}
								ErrorBoundary={LexicalErrorBoundary}
							/>
							<EditorRefPlugin editorRef={editorRef} />
							<FootnotePlugin 
								containerNodeClass={NestedFootnoteDemoNode}
								getNestedEditor={(node) => {
									if (node instanceof NestedFootnoteDemoNode) {
										return node.getNestedEditor();
									}
									return null;
								}}
							/>
							<HistoryPlugin />
						</div>
					</SharedHistoryContext>
				</LexicalComposer>
				<button type="submit">Submit</button>
			</form>
		</div>
	);
}

export default EditorShowcaseNested;