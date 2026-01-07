import { createCustomReferenceNode, type ReferenceComponentProps } from "lexical-ugly-footnotes/client";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey } from "lexical";
import { useCallback, useEffect } from "react";
import { useNodeActive } from "lexical-ugly-footnotes/client";
import { useNodeFocus } from "lexical-ugly-footnotes/client";

const HackerNewsReference = ({ nodeKey, referenceId, order }: ReferenceComponentProps) => {
    const [editor] = useLexicalComposerContext();
    const { ref, isActive, setActive } = useNodeActive<HTMLElement>({});
    const { isFocus } = useNodeFocus({ nodeKey });

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (isFocus && (e.key === "Backspace" || e.key === "Delete")) {
                e.preventDefault();
                editor.update(() => {
                    const node = $getNodeByKey(nodeKey);
                    if (node) {
                        node.remove();
                    }
                });
            }
        },
        [editor, nodeKey, isFocus],
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);

    return (
        <span
            ref={ref}
            onClick={() => setActive(true)}
            onKeyDown={() => {}}
            tabIndex={0}
            className="hn-reference"
            style={{
                cursor: "pointer",
            }}
        >
            [{order}]
        </span>
    );
};

// Create custom nodes (module level)
const [HackerNewsReferenceNode, hackerNewsReferenceReplacement] = createCustomReferenceNode(HackerNewsReference);
export { HackerNewsReferenceNode, hackerNewsReferenceReplacement };

