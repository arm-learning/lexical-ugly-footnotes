"use client";

import { useTransition, useState } from "react";
import type { LexicalEditor } from "lexical";
import { $generateHtmlFromNodes } from "@lexical/html";
import type { SaveResult } from "../_actions/save-content";
import type { ComponentType } from "react";

interface EditorComponentProps {
    submitHandler: (editor: LexicalEditor) => void;
    content: string | null;
}

interface CustomEditorClientProps {
    content: string | null;
    saveAction: (content: string) => Promise<SaveResult>;
    EditorComponent: ComponentType<EditorComponentProps>;
}

const CustomEditorClient = ({ content, saveAction, EditorComponent }: CustomEditorClientProps) => {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const handleSubmit = async (editor: LexicalEditor) => {
        setStatus("idle");
        setErrorMessage("");

        const contentToSave = editor.read(() => {
            return $generateHtmlFromNodes(editor, null);
        });

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
                <EditorComponent submitHandler={handleSubmit} content={content} />
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

export default CustomEditorClient;