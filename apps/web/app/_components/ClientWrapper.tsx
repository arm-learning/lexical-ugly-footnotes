"use client";

import { Editor } from "@repo/ui";
import type { LexicalEditor } from "lexical";

const ClientWrapper = () => {
  const submitHandler = async (editor: LexicalEditor) => {
    console.log(editor);
  }
  return (
    <>
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Lexical Editor</h2>
        <Editor submitHandler={submitHandler} />
      </div>
    </>
  );
};

export default ClientWrapper;
