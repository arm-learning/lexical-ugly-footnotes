import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $createTextNode,
  $getNodeByKey,
  $getRoot,
} from "lexical";
import { useCallback } from "react";

interface EditorKeyDownProps {
  nodeKey: string;
}

export const useEditorKeyDown = ({ nodeKey }: EditorKeyDownProps) => {
  const [editor] = useLexicalComposerContext();
  const $insertNewParagraphToRoot = useCallback((insert: "up" | "down") => {
    try {
      const rootElement = $getRoot();
      const text = $createTextNode("");
      const p = $createParagraphNode().append(text);
      if (insert === "down") {
        rootElement?.append(p);
      } else if (insert === "up") {
        const firstChild = rootElement.getFirstChild();
        if (firstChild) {
          firstChild?.insertBefore(p);
        } else {
          rootElement?.append(p);
        }
      }
      return p;
      // const root = $getRoot();
      // const text = $createTextNode("");
      // const p = $createParagraphNode();
      // p.append(text);
      // if (insert === "down") {
      // 	root.append(p);
      // }
      // if (insert === "up") {
      // 	const firstChild = root.getFirstChild();
      // 	if (firstChild) {
      // 		firstChild.insertBefore(p);
      // 	}
      // 	if (!firstChild) {
      // 		root.append(p);
      // 	}
      // }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const replaceExistingTextWithparagraph = useCallback(
    (text: string, insert: "up" | "down") => {
      editor.update(() => {
        const p = $createParagraphNode();
        const textNode = $createTextNode(text);
        p.append(textNode);
        const node = $getNodeByKey(nodeKey);
        node?.replace(p);

        const isNextSibling = node?.getNextSibling();
        if (!isNextSibling && insert === "down") {
          $insertNewParagraphToRoot(insert);
        } else if (isNextSibling && insert === "down") {
          return isNextSibling?.selectStart();
        }

        const isPreviousSibling = node?.getPreviousSibling();
        if (!isPreviousSibling && insert === "up") {
          $insertNewParagraphToRoot(insert);
        } else if (isPreviousSibling && insert === "up") {
          return isPreviousSibling?.selectStart();
        }

        p.selectEnd();
      });
      // editor.update(() => {
      // 	const p = $createParagraphNode();
      // 	const textNode = $createTextNode(text ?? "");
      // 	p.append(textNode);
      // 	const node = $getNodeByKey(nodeKey);
      // 	if (!node) return;
      // 	node.replace(p);
      // 	const nextSibling = node.getNextSibling();
      // 	const isNextSibling = !!nextSibling;
      // 	if (!isNextSibling && insert === "down") {
      // 		return $insertNewParagraphToRoot(insert);
      // 	}
      // 	if (isNextSibling && insert === "down") {
      // 		return nextSibling.selectEnd();
      // 	}
      // 	const previousSibling = node.getPreviousSibling();
      // 	const isPreviousSibling = !!previousSibling;
      // 	if (!isPreviousSibling && insert === "up") {
      // 		return $insertNewParagraphToRoot(insert);
      // 	}
      // 	if (isPreviousSibling && insert === "up") {
      // 		return previousSibling.selectEnd();
      // 	}
      // 	p.selectEnd();
      // });
    },
    [$insertNewParagraphToRoot, editor, nodeKey],
  );

  const escapeWithParagraph = useCallback(
    (insert: "up" | "down") => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);

        const isNextSibling = node?.getNextSibling();
        if (!isNextSibling && insert === "down") {
          const newParagraph = $insertNewParagraphToRoot(insert);
          newParagraph?.selectEnd();
        } else if (isNextSibling && insert === "down") {
          return isNextSibling?.selectEnd();
        }

        const isPreviousSibling = node?.getPreviousSibling();
        if (!isPreviousSibling && insert === "up") {
          const newParagraph = $insertNewParagraphToRoot(insert);
          newParagraph?.selectEnd();
        } else if (isPreviousSibling && insert === "up") {
          return isPreviousSibling?.selectEnd();
        }
        // const node = $getNodeByKey(nodeKey);
        // if (!node) return;
        // const nextSibling = node.getNextSibling();
        // const isNextSibling = !!nextSibling;
        // if (!isNextSibling && insert === "down") {
        // 	return $insertNewParagraphToRoot(insert);
        // }
        // if (isNextSibling && insert === "down") {
        // 	return nextSibling.selectEnd();
        // }
        // const previousSibling = node.getPreviousSibling();
        // const isPreviousSibling = !!previousSibling;
        // if (!isPreviousSibling && insert === "up") {
        // 	return $insertNewParagraphToRoot(insert);
        // }
        // if (isPreviousSibling && insert === "up") {
        // 	return previousSibling.selectEnd();
        // }
      });
    },
    [editor, $insertNewParagraphToRoot, nodeKey],
  );

  return {
    replaceExistingTextWithparagraph,
    escapeWithParagraph,
  };
};
