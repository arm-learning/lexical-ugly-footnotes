"use client";

import { Editor } from "@repo/ui";
import { $generateHtmlFromNodes } from "@lexical/html";
import type { LexicalEditor } from "lexical";
import { useTransition, useState } from "react";
import type { SaveResult } from "../_actions/save-content";

interface EditorClientProps {
    content: string;
    format: "json" | "html";
    saveAction: (content: string) => Promise<SaveResult>;
}

export function EditorClient({ content, format, saveAction }: EditorClientProps) {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const handleSubmit = async (editor: LexicalEditor) => {
        setStatus("idle");
        setErrorMessage("");

        let contentToSave: string;

        if (format === "json") {
            const editorState = editor.getEditorState();
            contentToSave = JSON.stringify(editorState.toJSON());
        } else {
            contentToSave = editor.read(() => {
                return $generateHtmlFromNodes(editor, null);
            });
        }

        startTransition(async () => {
            const result = await saveAction(contentToSave);
            if (result.success) {
                setStatus("success");
                setTimeout(() => setStatus("idle"), 2000);
            } else {
                setStatus("error");
                setErrorMessage(result.error || "Failed to save");
            }
        });
    };

    return (
        <div className="w-full">
            <div className="mb-4">
                <Editor submitHandler={handleSubmit} content={content} />
            </div>

            <div className="flex items-center gap-4">
                {isPending && (
                    <span className="text-sm text-gray-500">Saving...</span>
                )}
                {status === "success" && (
                    <span className="text-sm text-green-600">✓ Saved successfully</span>
                )}
                {status === "error" && (
                    <span className="text-sm text-red-600">✗ {errorMessage}</span>
                )}
            </div>
        </div>
    );
}
