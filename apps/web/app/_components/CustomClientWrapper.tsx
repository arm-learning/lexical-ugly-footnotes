"use client";

import { EditorCustom } from "@repo/ui";
import type { LexicalEditor } from "lexical";

const CustomClientWrapper = ({ content }: { content: string }) => {
  const submitHandler = async (editor: LexicalEditor) => {
    console.log(editor);
  };
  console.log("custom client wrapper", { content });
  return (
    <>
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Lexical Editor</h2>
        <EditorCustom submitHandler={submitHandler} content={content} />
      </div>
    </>
  );
};

export default CustomClientWrapper;
