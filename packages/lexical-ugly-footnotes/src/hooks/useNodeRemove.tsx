import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $createTextNode, $getNodeByKey } from "lexical";
import { useCallback } from "react";

interface NodeRemoveProps {
	nodeKey: string;
}
export const useNodeRemove = ({ nodeKey }: NodeRemoveProps) => {
	const [editor] = useLexicalComposerContext();
	const removeNodeAndReplaceParagraph = useCallback(() => {
		editor.update(() => {
			const p = $createParagraphNode();
			const textNode = $createTextNode();
			p.append(textNode);
			const node = $getNodeByKey(nodeKey);
			if (node) {
				node.replace(p);
				// node.selectEnd();
				p.selectEnd();
			}
		});
	}, [editor, nodeKey]);
	return { removeNodeAndReplaceParagraph };
};
