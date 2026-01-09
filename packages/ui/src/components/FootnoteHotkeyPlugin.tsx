import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { COMMAND_PRIORITY_NORMAL, KEY_DOWN_COMMAND } from "lexical";
import { INSERT_FOOTNOTE_BLOCK_COMMAND } from "lexical-ugly-footnotes/client";
import { useEffect } from "react";

type FootnoteHotkeyPluginProps = {};

const FootnoteHotkeyPlugin = ({}: FootnoteHotkeyPluginProps) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        const { key, metaKey, ctrlKey, altKey, shiftKey } = event;

        if (key === "f" && (metaKey || ctrlKey) && altKey && !shiftKey) {
          event.preventDefault();
          event.stopPropagation();
          editor.dispatchCommand(INSERT_FOOTNOTE_BLOCK_COMMAND, undefined);
          return true; // Indicates the command was handled
        }
        return false; // Let other handlers process this event
      },
      COMMAND_PRIORITY_NORMAL,
    );
  }, [editor]);

  return null;
};

export default FootnoteHotkeyPlugin;
