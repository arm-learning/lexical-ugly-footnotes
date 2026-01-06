"use client";

import { Editor } from "@repo/ui";
import {
    EditorShowcaseCssVars,
    EditorShowcaseTheme,
    EditorShowcaseOverride,
    EditorShowcaseNested,
} from "@repo/ui";
import { useTransition, useState } from "react";
import type { LexicalEditor } from "lexical";
import { $generateHtmlFromNodes } from "@lexical/html";
import type { SaveResult, DemoType } from "../_actions/save-content";
import { saveContent } from "../_actions/save-content";

interface UnifiedEditorClientProps {
    content: string | null;
    format: "html" | "json";
    demoType: DemoType;
}

export function UnifiedEditorClient({
    content,
    format,
    demoType,
}: UnifiedEditorClientProps) {
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
            const result = await saveContent(contentToSave, demoType, format);
            if (result.success) {
                setStatus("success");
                setTimeout(() => setStatus("idle"), 2000);
            } else {
                setStatus("error");
                setErrorMessage(result.error || "Failed to save");
            }
        });
    };

    // Select the appropriate editor component based on demoType
    const getEditorComponent = () => {
        switch (demoType) {
            case "css-vars":
                return (
                    <EditorShowcaseCssVars
                        submitHandler={handleSubmit}
                        content={content}
                    />
                );
            case "theme":
                return (
                    <EditorShowcaseTheme
                        submitHandler={handleSubmit}
                        content={content}
                    />
                );
            case "override":
                return (
                    <EditorShowcaseOverride
                        submitHandler={handleSubmit}
                        content={content}
                    />
                );
            case "nested":
                return (
                    <EditorShowcaseNested
                        submitHandler={handleSubmit}
                        content={content}
                    />
                );
            case "default":
            default:
                return <Editor submitHandler={handleSubmit} content={content} />;
        }
    };

    return (
        <div className="w-full">
            <div className="mb-4">{getEditorComponent()}</div>

            <div className="flex items-center gap-4">
                {isPending && (
                    <span className="text-sm text-gray-500">Saving...</span>
                )}
                {status === "success" && (
                    <span className="text-sm text-green-600">
                        ✓ Saved successfully
                    </span>
                )}
                {status === "error" && (
                    <span className="text-sm text-red-600">
                        ✗ {errorMessage}
                    </span>
                )}
            </div>
        </div>
    );
}

