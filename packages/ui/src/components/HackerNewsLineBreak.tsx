import { createCustomLineBreakNode, type LineBreakComponentProps } from "lexical-ugly-footnotes/client";

const HackerNewsLineBreak = ({ nodeKey }: LineBreakComponentProps) => {
    // Return null to make line break invisible (Hacker News style)
    return null;
};

const [HackerNewsLineBreakNode, hackerNewsLineBreakReplacement] = createCustomLineBreakNode(
    HackerNewsLineBreak,
    {
        exportDOM: (node) => {
            const br = document.createElement("br");
            return {
                element: br,
            };
        },
        importDOM: (NodeClass) => {
            return {
                br: (domNode: Node) => {
                    if (domNode instanceof HTMLBRElement) {
                        return {
                            conversion: () => {
                                return { node: new NodeClass() };
                            },
                            priority: 1,
                        };
                    }
                    return null;
                },
            };
        },
    }
);

export { HackerNewsLineBreakNode, hackerNewsLineBreakReplacement };

