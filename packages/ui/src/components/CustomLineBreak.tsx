import { createCustomLineBreakNode, type LineBreakComponentProps } from "lexical-ugly-footnotes";

const MyLineBreak = ({ nodeKey }: LineBreakComponentProps) => {
    
    console.log("🎉 Custom LineBreak rendered!", nodeKey);  
    return (
    
    <div className="my-custom-linebreak">
        <hr className="fancy-hr" />
    </div>
)};

const [CustomLineBreakNode, lineBreakReplacement] = createCustomLineBreakNode(MyLineBreak);
export { CustomLineBreakNode, lineBreakReplacement };