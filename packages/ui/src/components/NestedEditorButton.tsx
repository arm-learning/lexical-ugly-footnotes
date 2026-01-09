import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getRoot,
  $getSelection,
  $insertNodes,
  $isRangeSelection,
} from "lexical";
import { LayersIcon } from "lucide-react";
import { $createNestedFootnoteDemoNode } from "../nodes/NestedFootnoteDemoNode.js";

type NestedEditorButtonProps = {};

const NestedEditorButton = () => {
  const [editor] = useLexicalComposerContext();

  const handleClick = () => {
    editor.update(() => {
      const selection = $getSelection();
      const nestedNode = $createNestedFootnoteDemoNode(
        undefined,
        "New nested editor",
      );

      if ($isRangeSelection(selection)) {
        $insertNodes([nestedNode]);
      } else {
        // If no selection, append to the end of the root
        const root = $getRoot();
        root.append(nestedNode);
      }
    });
  };

  return (
    <button
      className="flex items-center gap-1 px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors"
      type="button"
      onClick={handleClick}
      title="Insert nested editor"
    >
      <LayersIcon size={16} />
      <span>Nested Editor</span>
    </button>
  );
};

export default NestedEditorButton;
