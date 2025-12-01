import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_FOOTNOTE_BLOCK_COMMAND } from "lexical-ugly-footnotes";
import { SquarePlusIcon } from "lucide-react";

interface FootnoteButtonProps {
}

const FootnoteButton = () => {
    const [editor] = useLexicalComposerContext();
    return (
        <button className="" type="button" onClick={() => editor.dispatchCommand(INSERT_FOOTNOTE_BLOCK_COMMAND, undefined)}>
            <SquarePlusIcon />
        </button>
    );
}

export default FootnoteButton;