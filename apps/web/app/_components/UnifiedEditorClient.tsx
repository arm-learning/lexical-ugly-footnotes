"use client";

import { Editor } from "@repo/ui";
import { useTransition, useState, useLayoutEffect } from "react";
import type { LexicalEditor } from "lexical";
import { $generateHtmlFromNodes } from "@lexical/html";
import type { SaveResult, DemoType } from "../_actions/save-content";
import { saveContent, resetContent } from "../_actions/save-content";
import dynamic from "next/dynamic"
import { footnoteService } from "lexical-ugly-footnotes";
const EditorShowcaseCssVars = dynamic(() => import("@repo/ui/editor-showcase-css-vars"), {
    ssr: false,
});
const EditorShowcaseTheme = dynamic(() =>import("@repo/ui/editor-showcase-theme"), {
    ssr: false,
});
const EditorShowcaseOverride = dynamic(() =>import("@repo/ui/editor-showcase-override"), {
    ssr: false,
});
const EditorShowcaseNested = dynamic(() =>import("@repo/ui/editor-showcase-nested"), {
    ssr: false,
});
const EditorShowcaseHackerNews = dynamic(() =>import("@repo/ui/editor-showcase-hackernews"), {
    ssr: false,
});
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
    const [isResetting, setIsResetting] = useState(false);

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
            try {
                const result = await saveContent(contentToSave, demoType, format);
                if (result.success) {
                    setStatus("success");
                    setTimeout(() => setStatus("idle"), 2000);
                } else {
                    setStatus("error");
                    setErrorMessage(result.error || "Failed to save");
                }
            } catch (error) {
                console.error("[UnifiedEditorClient] Save error:", error);
                setStatus("error");
                setErrorMessage("Failed to save");
            }
        });
    };

    const handleReset = () => {
        if (!confirm(`Are you sure you want to reset the ${demoType} editor? This will clear all saved content.`)) {
            return;
        }

        setIsResetting(true);
        startTransition(async () => {
            try {
                const result = await resetContent(demoType, format);
                if (result.success) {
                    setStatus("success");
                    // Reload the page to show the reset content
                    window.location.reload();
                } else {
                    setStatus("error");
                    setErrorMessage(result.error || "Failed to reset");
                    setIsResetting(false);
                }
            } catch (error) {
                console.error("[UnifiedEditorClient] Reset error:", error);
                setStatus("error");
                setErrorMessage("Failed to reset");
                setIsResetting(false);
            }
        });
    };

    useLayoutEffect(() => {
        footnoteService.clear();
    }, []);

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
            case "hackernews":
                return (
                    <EditorShowcaseHackerNews
                        submitHandler={handleSubmit}
                        content={content}
                    />
                );
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
                {isResetting && (
                    <span className="text-sm text-gray-500">Resetting...</span>
                )}
                {status === "success" && !isResetting && (
                    <span className="text-sm text-green-600">
                        ✓ Saved successfully
                    </span>
                )}
                {status === "error" && (
                    <span className="text-sm text-red-600">
                        ✗ {errorMessage}
                    </span>
                )}
                <button
                    type="button"
                    onClick={handleReset}
                    disabled={isPending || isResetting}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Reset
                </button>
            </div>
        </div>
    );
}

