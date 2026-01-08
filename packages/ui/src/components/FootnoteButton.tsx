import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_FOOTNOTE_BLOCK_COMMAND } from "lexical-ugly-footnotes/client";
import { SquarePlusIcon } from "lucide-react";

interface FootnoteButtonProps {
}

const FootnoteButton = () => {
    const [editor] = useLexicalComposerContext();
    return (
        <button 
            className="flex items-center gap-1 px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors" 
            type="button" 
            onClick={() => editor.dispatchCommand(INSERT_FOOTNOTE_BLOCK_COMMAND, undefined)}
            title="Insert footnote"
        >
            <SquarePlusIcon size={16} />
            <span>Footnote</span>
        </button>
    );
}

export default FootnoteButton;