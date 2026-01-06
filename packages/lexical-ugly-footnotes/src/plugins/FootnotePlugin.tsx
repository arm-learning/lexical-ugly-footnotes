import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	mergeRegister,
} from "@lexical/utils";
import {
	$getNodeByKey,
	$getRoot,
	$getSelection,
	$isRangeSelection,
	$isRootNode,
	$isTextNode,
	COMMAND_PRIORITY_LOW,
	createCommand,
	type ElementNode,
	KEY_BACKSPACE_COMMAND,
	KEY_DELETE_COMMAND,
	type LexicalCommand,
	ParagraphNode,
	type TextNode,
} from "lexical";
import { useEffect } from "react";
import { $createFootnoteBlockNode, FootnoteBlockNode } from "../nodes/BlockNode.client.js";
import { $createFootnoteReferenceNode, FootnoteReferenceNode } from "../nodes/ReferenceNode.client.js";
import { $mirrorOrdersFromServiceIntoCurrentEditor, $nextFootnoteOrderWithIndex, footnoteService } from "../core/index.js";
import {
	$removeFootnoteByRefNodeKey,
	$reorderFootnoteBlocksFromService,
	$syncFootnotesInParent,
	$reorderAllReferencesFromService,
} from "../core/client.js";
import { v7 as uuidv7 } from "uuid";
import { $createFootnoteLineBreakNode, $isFootnoteLineBreakNode } from "../nodes/LineBreakNode.client.js";


export const INSERT_FOOTNOTE_BLOCK_COMMAND: LexicalCommand<void> =
	createCommand();

export const INSERT_FOOTNOTE_NESTED_COMMAND: LexicalCommand<void> =
	createCommand();
export const RECONCILE_FOOTNOTES_COMMAND = createCommand<void>();

const $findPreviousFootnoteBeforeCursor = (
	anchorNode: TextNode | ParagraphNode | ElementNode,
) => {};

export const FootnotePlugin = () => {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		if (!editor.hasNodes([FootnoteBlockNode, FootnoteReferenceNode])) {
			throw new Error(
				"Footnote Plugin: FootnoteBlockNode, FootnoteReferenceNode not registered on editor",
			);
		}

		return mergeRegister(
			editor.registerCommand(
				RECONCILE_FOOTNOTES_COMMAND,
				() => {
					editor.update(() => {
						$reorderAllReferencesFromService();
						$reorderFootnoteBlocksFromService();
					});
					return true;
				},
				COMMAND_PRIORITY_LOW,
			),
			editor.registerCommand(
				INSERT_FOOTNOTE_NESTED_COMMAND,
				() => {
					return true;
				},
				COMMAND_PRIORITY_LOW,
			),
			editor.registerCommand(
				INSERT_FOOTNOTE_BLOCK_COMMAND,
				() => {
					const selection = $getSelection();
					if (!$isRangeSelection(selection)) return false;
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
					const order = $nextFootnoteOrderWithIndex(anchorNode);

					footnoteService.upsertReference(referenceId, order);
					footnoteService.upsertBlock(referenceId, order);
					const root = $getRoot();
					const rootChildren = root.getChildren();
					const isFootnoteLineBreakNode = rootChildren.some((child) =>
						$isFootnoteLineBreakNode(child),
					);
					if (!isFootnoteLineBreakNode) {
						const footnoteLineBreakNode = $createFootnoteLineBreakNode();
						const footnoteBlockNode = $createFootnoteBlockNode(
							referenceId,
							order,
						);
						root.append(footnoteLineBreakNode);
						root.append(footnoteBlockNode);
					}
					const footnoteLineBreakNode = isFootnoteLineBreakNode
						? rootChildren.find((child) => $isFootnoteLineBreakNode(child))
						: null;

					const footnoteBlockNode = $createFootnoteBlockNode(
						referenceId,
						order,
					);
					if (footnoteLineBreakNode) {
						footnoteLineBreakNode.insertAfter(footnoteBlockNode);
					}

					const footnoteReferenceNode = $createFootnoteReferenceNode(
						referenceId,
						order,
					);

					if ($isTextNode(anchorNode)) {
						const offset = selection.anchor.offset;
						const text = anchorNode.getTextContent();
						if (offset > 0 && offset < anchorNode.getTextContentSize()) {
							const lastSpaceBeforeCursor = text.lastIndexOf(" ", offset - 1);

							if (lastSpaceBeforeCursor !== -1) {
								const nextSpace = text.indexOf(" ", offset);
								const splitPosition = nextSpace !== -1 ? nextSpace : offset;
								const [beforeNode, afterNode] =
									anchorNode.splitText(splitPosition);
								if (beforeNode?.getTextContent().endsWith(" ")) {
									beforeNode.setTextContent(
										beforeNode.getTextContent().trimEnd(),
									);
								}
								beforeNode?.insertAfter(footnoteReferenceNode);
								if (!afterNode?.getTextContent().startsWith(" ")) {
									afterNode?.setTextContent(` ${afterNode?.getTextContent()}`);
								}
                                if (afterNode) {
									footnoteReferenceNode.insertAfter(afterNode);
								}
							} else {
								const [beforeNode, afterNode] = anchorNode.splitText(offset);
								beforeNode?.insertAfter(footnoteReferenceNode);
                                if (afterNode) {
									footnoteReferenceNode.insertAfter(afterNode);
								}
							}
						} else {
							anchorNode.insertAfter(footnoteReferenceNode);
						}
					}
					$reorderAllReferencesFromService();

					$reorderFootnoteBlocksFromService();

					return true;
				},
				COMMAND_PRIORITY_LOW,
			),
			editor.registerCommand(
				KEY_BACKSPACE_COMMAND,
				() => {
					const selection = $getSelection();
					if ($isRangeSelection(selection)) {
						const node = selection.anchor.getNode();
						if (node instanceof FootnoteReferenceNode) {
							editor.update(
								() => {
									node.remove();
									$removeFootnoteByRefNodeKey(node.getKey());
								},
								{ discrete: true },
							);
							editor.dispatchCommand(RECONCILE_FOOTNOTES_COMMAND, undefined);
							return true;
						}

						const prevSibling = node.getPreviousSibling();
						if (
							selection.anchor.offset === 0 &&
							prevSibling instanceof FootnoteReferenceNode
						) {
							editor.update(
								() => {
									prevSibling.remove();
									$removeFootnoteByRefNodeKey(node.getKey());
								},
								{ discrete: true },
							);
							editor.dispatchCommand(RECONCILE_FOOTNOTES_COMMAND, undefined);
							return true;
						}
					}
					return false;
				},
				COMMAND_PRIORITY_LOW,
			),
			editor.registerCommand(
				KEY_DELETE_COMMAND,
				() => {
					const selection = $getSelection();
					if ($isRangeSelection(selection)) {
						const node = selection.anchor.getNode();
						if (node instanceof FootnoteReferenceNode) {
							editor.update(
								() => {
									node.remove();
									$removeFootnoteByRefNodeKey(node.getKey());
								},
								{ discrete: true },
							);
							editor.dispatchCommand(RECONCILE_FOOTNOTES_COMMAND, undefined);
							return true;
						}

						const nextSibling = node.getNextSibling();
						if (
							selection.anchor.offset === node.getTextContentSize() &&
							nextSibling instanceof FootnoteReferenceNode
						) {
							editor.update(
								() => {
									nextSibling.remove();
									$removeFootnoteByRefNodeKey(node.getKey());
								},
								{ discrete: true },
							);
							editor.dispatchCommand(RECONCILE_FOOTNOTES_COMMAND, undefined);
							return true;
						}
					}
					return false;
				},
				COMMAND_PRIORITY_LOW,
			),
			editor.registerMutationListener(
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
                                    const referenceId = node?.getReferenceId();
									if (referenceId) {
										destroyedNodes.push(referenceId);
									}
								}
							}
						});
						for (const referenceId of destroyedNodes) {
							footnoteService.removeRefAndBlock(referenceId);
						}
						editor.update(() => {
							$reorderAllReferencesFromService();
							$reorderFootnoteBlocksFromService();
						});
					}
				},
			),
			editor.registerMutationListener(FootnoteBlockNode, (mutatedNodes) => {
				const values = Array.from(mutatedNodes.values());
				if (values.some((value) => value === "destroyed")) {
					editor.update(() => {
						$syncFootnotesInParent();
						$mirrorOrdersFromServiceIntoCurrentEditor();
					});
				}
			}),
		);
	}, [editor]);

	return null;
};

export default FootnotePlugin;
