import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { $getSelection, $isNodeSelection, type BaseSelection } from "lexical";
import { useEffect, useState } from "react";

interface useNodeFocusProps {
  nodeKey: string;
}
export const useNodeFocus = ({ nodeKey }: useNodeFocusProps) => {
  const [editor] = useLexicalComposerContext();
  const [selection, setSelection] = useState<BaseSelection | null>(null);
  const [isFocus, setFocus] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const unregister = mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        if (isMounted) {
          const selection = editorState.read(() => $getSelection());
          setSelection(selection);
        }
      }),
    );
    return () => {
      isMounted = false;
      unregister();
    };
  }, [editor]);

  useEffect(() => {
    if ($isNodeSelection(selection) && selection) {
      const node = selection._nodes.has(nodeKey);
      if (node) {
        setFocus(true);
      }
    } else {
      setFocus(false);
    }
  }, [selection, nodeKey]);

  return { isFocus };
};
