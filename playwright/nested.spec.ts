import { test } from "@playwright/test";
import { DemoPage } from "./demo-page";

test.describe("Nested Editor", () => {
    let demoPage: DemoPage;

    test.beforeEach(async ({ page }) => {
        demoPage = new DemoPage(page);
    });

    test("should add footnote, save, and preview in nested editor", async () => {
        const nestedContent = `Nested Content ${Date.now()}`;
        const footnoteText = `Test footnote content for nested ${Date.now()}`;

        await demoPage.goto('nested');

        // Add a new nested editor
        await demoPage.addNestedEditor();

        // Note: The page starts with one nested editor. Providing no index or high index might be tricky if not careful.
        // `addNestedEditor` appends to the end.
        // In this environment, the default nested editor seems to be missing, so the added one is at index 0.

        // Type in the new nested editor (index 0)
        await demoPage.typeInNestedEditor(nestedContent, 0);

        // Add footnote to the new nested editor (index 0)
        await demoPage.addNestedFootnote(0);
        await demoPage.verifyFootnoteElements('nested');

        // Type content in the footnote
        await demoPage.typeInNestedFootnote(footnoteText);

        // Submit
        await demoPage.submit();

        // Preview
        await demoPage.goToPreview();

        // Verify
        // Content should be present in the preview
        await demoPage.verifyPreviewContent(nestedContent);
        // Footnote content should also be visible (rendered by the nested editor in preview)
        await demoPage.verifyPreviewContent(footnoteText);
    });
});
