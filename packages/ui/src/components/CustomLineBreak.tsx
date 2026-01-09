import {
  type LineBreakComponentProps,
  createCustomLineBreakNode,
} from "lexical-ugly-footnotes/client";

const MyLineBreak = ({ nodeKey }: LineBreakComponentProps) => {
  console.log("🎉 Custom LineBreak rendered!", nodeKey);
  return (
    <div className="my-custom-linebreak">
      <hr className="fancy-hr" />
    </div>
  );
};

const [CustomLineBreakNode, lineBreakReplacement] =
  createCustomLineBreakNode(MyLineBreak);
export { CustomLineBreakNode, lineBreakReplacement };
