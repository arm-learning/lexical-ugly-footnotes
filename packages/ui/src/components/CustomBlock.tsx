import { createCustomBlockNode, type BlockComponentProps } from "lexical-ugly-footnotes";


const MyBlock = ({ nodeKey, referenceId, order, blockNote }: BlockComponentProps) => (
    <div className="my-custom-block">
        {/* Your custom block UI */}
    </div>
);


const [CustomBlockNode, blockReplacement] = createCustomBlockNode(MyBlock);
export { CustomBlockNode, blockReplacement };