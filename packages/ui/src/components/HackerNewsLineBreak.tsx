import { createCustomLineBreakNode, type LineBreakComponentProps } from "lexical-ugly-footnotes/client";

const HackerNewsLineBreak = ({ nodeKey }: LineBreakComponentProps) => {
    // Return null to make line break invisible (Hacker News style)
    return null;
};

const [HackerNewsLineBreakNode, hackerNewsLineBreakReplacement] = createCustomLineBreakNode(HackerNewsLineBreak);
export { HackerNewsLineBreakNode, hackerNewsLineBreakReplacement };

