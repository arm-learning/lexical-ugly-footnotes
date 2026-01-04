import { createCustomReferenceNode, type ReferenceComponentProps } from "lexical-ugly-footnotes";


const MyReference = ({ nodeKey, referenceId, order }: ReferenceComponentProps) => (
    <sup className="my-custom-reference">[{order}]</sup>
);

// Create custom nodes (module level)

const [CustomReferenceNode, referenceReplacement] = createCustomReferenceNode(MyReference);
export { CustomReferenceNode, referenceReplacement };