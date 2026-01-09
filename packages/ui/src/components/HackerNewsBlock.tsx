import { BLOCK_ATTR, createCustomBlockNode, type BlockComponentProps } from "lexical-ugly-footnotes/client";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { LexicalNestedComposer } from "@lexical/react/LexicalNestedComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { useCallback } from "react";
import { 
    $removeFootnoteByBlockNodeKey, 
    $removeFootnoteReferenceNodeByReferenceId,
    useSharedHistoryState,
} from "lexical-ugly-footnotes/client";
import { addClassNamesToElement } from "@lexical/utils";
// Import theme from nodes (re-exported from client)
// For Hacker News style, we use a minimal theme
const minimalTheme = {};

const HackerNewsBlock = ({
    referenceId = "",
    nodeKey,
    order = 0,
    blockNote,
    sharedHistoryState = true,
}: BlockComponentProps) => {
    const [editor] = useLexicalComposerContext();
    const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
    const { historyState } = useSharedHistoryState();

    const onSubmit = useCallback(() => {
        editor.update(
            () => {
                $removeFootnoteByBlockNodeKey(nodeKey);
            },
            { discrete: true },
        );
        editor.update(
            () => {
                if (referenceId) {
                    $removeFootnoteReferenceNodeByReferenceId(referenceId);
                }
            },
            { discrete: true },
        );
    }, [editor, nodeKey, referenceId]);

    return (
        <div className="hn-block grid grid-cols-[auto_auto_auto] gap-1" style={{ margin: "4px 0" }}>
            <span>[{order}]</span>
            <button
                type="button"
                onClick={onSubmit}
                className="hn-delete"
                style={{
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    color: "#999",
                    fontSize: "18px",
                    lineHeight: "1",
                }}
                aria-label="Delete footnote"
            >
                ×
            </button>
            <LexicalNestedComposer initialEditor={blockNote} initialTheme={minimalTheme}>
                <RichTextPlugin
                    contentEditable={
                        <ContentEditable
                            className="hn-block-editor border-b-2 border-gray-200"
                            style={{
                                display: "inline",
                                minWidth: "200px",
                                outline: isSelected ? "1px solid #ccc" : "none",
                            }}
                        />
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                    placeholder={null}
                />
                <HistoryPlugin externalHistoryState={historyState} />
            </LexicalNestedComposer>
        </div>
    );
};

// Create custom nodes (module level)
const [HackerNewsBlockNode, hackerNewsBlockReplacement] = createCustomBlockNode(
    HackerNewsBlock,
    {
        createDOM: (node) => {
            const div = document.createElement("div");
            addClassNamesToElement(div, "hn-block-container");
            div.setAttribute(BLOCK_ATTR.container, "");
            const referenceId = node.getReferenceId();
                if (referenceId) {
                    div.setAttribute(BLOCK_ATTR.reference_id, referenceId);
            }
            const order = node.getOrder();
            if (order) {
                div.setAttribute(BLOCK_ATTR.order, order.toString());
            }
            // Add custom attributes
            div.setAttribute("data-hn-style", "true");
            return div;
        }
    }
);
export { HackerNewsBlockNode, hackerNewsBlockReplacement };

