import { createCustomBlockNode, type BlockComponentProps } from "lexical-ugly-footnotes/client";
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
    $removeFootnoteByBlockNodeKeyTwo, 
    $removeFootnoteReferenceNodeByReferenceId,
    useSharedHistoryState,
} from "lexical-ugly-footnotes/client";
// Import theme from nodes (re-exported from client)
// For Hacker News style, we use a minimal theme
const minimalTheme = {};
import { XIcon } from "lucide-react";

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
                $removeFootnoteByBlockNodeKeyTwo(nodeKey);
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
        <p className="hn-block" style={{ margin: "4px 0" }}>
            <span style={{ marginRight: "4px" }}>[{order}]</span>
            <LexicalNestedComposer initialEditor={blockNote} initialTheme={minimalTheme}>
                <RichTextPlugin
                    contentEditable={
                        <ContentEditable
                            className="hn-block-editor"
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
                <LinkPlugin
                    attributes={{
                        rel: "nofollow",
                        target: "_blank",
                    }}
                />
                <HistoryPlugin externalHistoryState={historyState} />
            </LexicalNestedComposer>
            <button
                type="button"
                onClick={onSubmit}
                className="hn-delete"
                style={{
                    marginLeft: "8px",
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
        </p>
    );
};

// Create custom nodes (module level)
const [HackerNewsBlockNode, hackerNewsBlockReplacement] = createCustomBlockNode(HackerNewsBlock);
export { HackerNewsBlockNode, hackerNewsBlockReplacement };

