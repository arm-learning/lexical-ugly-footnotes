import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
	$getChildCaretOrSelf,
	$getNodeByKey,
	$getRoot,
	$getSelection,
	$getSiblingCaret,
	$isRangeSelection,
	$isRootNode,
	$isTextNode,
	type CaretDirection,
	COMMAND_PRIORITY_LOW,
	COMMAND_PRIORITY_NORMAL,
	createCommand,
	type LexicalCommand,
	type LexicalEditor,
	type NodeCaret,
	ParagraphNode,
} from "lexical";
import { useEffect } from "react";
import { INSERT_FOOTNOTE_BLOCK_COMMAND, RECONCILE_FOOTNOTES_COMMAND } from "./FootnotePlugin.js";
import { footnoteService, isEditorActive, nextOrderForChildInsertion } from "../core/index.js";
import { v7 as uuidv7 } from "uuid";
import { $createFootnoteReferenceNode, FootnoteReferenceNode } from "../nodes/ReferenceNode.js";

interface NestedFootnotePluginProps {
	editor: LexicalEditor;
	nodeKey: string;
}

export const UPDATE_FOOTNOTE_ORDERS_COMMAND: LexicalCommand<void> =
	createCommand();
export const REMOVE_FOOTNOTE_REFERENCE_NODE_BY_REFERENCE_ID_COMMAND: LexicalCommand<string> =
	createCommand();

const NestedFootnotePlugin = ({
	editor,
	nodeKey,
}: NestedFootnotePluginProps) => {
	const [nestedEditor] = useLexicalComposerContext();
	useEffect(() => {
		return mergeRegister(
			editor.registerCommand(
				INSERT_FOOTNOTE_BLOCK_COMMAND,
				() => {

					let isHandled = false;
					nestedEditor.update(
						() => {
							const isActive = isEditorActive(nestedEditor);

							if (!isActive) {
								isHandled = false;
								return true;
							}
							const selection = $getSelection();
							if (!$isRangeSelection(selection)) {
								isHandled = false;
								return true;
							}

							const anchorNode = selection.anchor.getNode();
							if (anchorNode instanceof ParagraphNode) {
								if (
									$isRootNode(anchorNode.getParent()) &&
									anchorNode.getChildren().length === 0
								) {

									anchorNode.selectEnd();
									return true;
								}
							}
							const referenceId = uuidv7();

							const order = nextOrderForChildInsertion(
								anchorNode,
								editor,
								nodeKey,
							);

							footnoteService.upsertReference(referenceId, order);
							footnoteService.upsertBlock(referenceId, order);

							const footnoteReferenceNode = $createFootnoteReferenceNode(
								referenceId,
								order,
							);

							if ($isTextNode(anchorNode)) {
								const offset = selection.anchor.offset;
								const text = anchorNode.getTextContent();
								if (offset > 0 && offset < anchorNode.getTextContentSize()) {
									const lastSpaceBeforeCursor = text.lastIndexOf(
										" ",
										offset - 1,
									);

									if (lastSpaceBeforeCursor !== -1) {
										const nextSpace = text.indexOf(" ", offset);
										const splitPosition = nextSpace !== -1 ? nextSpace : offset;
										const [beforeNode, afterNode] =
											anchorNode.splitText(splitPosition);
										if (beforeNode?.getTextContent().endsWith(" ")) {
											beforeNode?.setTextContent(
												beforeNode?.getTextContent().trimEnd(),
											);
										}
										beforeNode?.insertAfter(footnoteReferenceNode);
										if (!afterNode?.getTextContent().startsWith(" ")) {
											afterNode?.setTextContent(
												` ${afterNode.getTextContent()}`,
											);
										}
                                        if (afterNode) {
											footnoteReferenceNode.insertAfter(afterNode);
										}
									} else {
										const [beforeNode, afterNode] =
											anchorNode.splitText(offset);
										beforeNode?.insertAfter(footnoteReferenceNode);
                                        if (afterNode) {
											footnoteReferenceNode.insertAfter(afterNode);
										}

									}
								} else {
									anchorNode.insertAfter(footnoteReferenceNode);
								}
								isHandled = true;
							}
						},
						{ discrete: true },
					);
					if (isHandled) {
						editor.dispatchCommand(RECONCILE_FOOTNOTES_COMMAND, undefined);
						return true;
					}

					return isHandled;
				},
				COMMAND_PRIORITY_NORMAL,
			),
		);
	}, [editor, nestedEditor, nodeKey]);

	useEffect(() => {
		return mergeRegister(
			nestedEditor.registerCommand(
				REMOVE_FOOTNOTE_REFERENCE_NODE_BY_REFERENCE_ID_COMMAND,
				(targetReferenceId) => {
					nestedEditor.update(
						() => {
							const childRoot = $getRoot();

							let childCaret: NodeCaret<"next"> | null = $getChildCaretOrSelf(
								$getSiblingCaret(childRoot, "next"),
							);

							function childStep<D extends CaretDirection>(
								currentCaret: NodeCaret<D>,
							): null | NodeCaret<D> {
								const nextCaret = currentCaret.getAdjacentCaret();
								return (
									nextCaret?.getChildCaret() ||
									nextCaret ||
									currentCaret.getParentCaret("root")
								);
							}

							for (; childCaret !== null; childCaret = childStep(childCaret)) {
								const childNodeAt = childCaret.getNodeAtCaret();
								if (!childNodeAt) continue;

								if (childNodeAt instanceof FootnoteReferenceNode) {
									const referenceId = childNodeAt.getReferenceId();
									if (referenceId === targetReferenceId) {
										childNodeAt.remove();
									}
								}
							}
						},
						{ discrete: true },
					);
					return true;
				},
				COMMAND_PRIORITY_LOW,
			),
			nestedEditor.registerCommand(
				UPDATE_FOOTNOTE_ORDERS_COMMAND,
				() => {
					nestedEditor.update(
						() => {
							const childRoot = $getRoot();

							let childCaret: NodeCaret<"next"> | null = $getChildCaretOrSelf(
								$getSiblingCaret(childRoot, "next"),
							);

							function childStep<D extends CaretDirection>(
								currentCaret: NodeCaret<D>,
							): null | NodeCaret<D> {
								const nextCaret = currentCaret.getAdjacentCaret();
								return (
									nextCaret?.getChildCaret() ||
									nextCaret ||
									currentCaret.getParentCaret("root")
								);
							}

							for (; childCaret !== null; childCaret = childStep(childCaret)) {
								const childNodeAt = childCaret.getNodeAtCaret();
								if (!childNodeAt) continue;

								if (childNodeAt instanceof FootnoteReferenceNode) {
									const referenceId = childNodeAt.getReferenceId();
									if (!referenceId) continue;
									const idx = footnoteService.indexOf(referenceId);
									if (idx !== undefined) childNodeAt.setOrder(idx + 1);
								}
							}
						},
						{ discrete: true },
					);
					return true;
				},
				COMMAND_PRIORITY_LOW,
			),
			nestedEditor.registerMutationListener(
				FootnoteReferenceNode,
				(mutatedNodes, { prevEditorState, dirtyLeaves, updateTags }) => {
					const destroyedKeys = Array.from(mutatedNodes.entries())
						.filter(([_, mutation]) => mutation === "destroyed")
						.map(([key]) => key);

					if (destroyedKeys.length > 0) {
						const destroyedNodes: string[] = [];
						prevEditorState.read(() => {
							for (const key of destroyedKeys) {
								const node = $getNodeByKey(key);
								if (node instanceof FootnoteReferenceNode) {
									const referenceId = node.getReferenceId();
									if (referenceId) {
										destroyedNodes.push(referenceId);
									}
								}
							}
						});
						for (const referenceId of destroyedNodes) {
							footnoteService.removeRefAndBlock(referenceId);
						};
						editor.dispatchCommand(RECONCILE_FOOTNOTES_COMMAND, undefined);

					}
				},
			),
		);
	}, [nestedEditor, editor]);
	return null;
};

export default NestedFootnotePlugin;
