import { expect, test } from "@playwright/test";
import { DemoPage } from "./demo-page";

test.describe("Footnote Demo Editor", () => {
    let demoPage: DemoPage;

    test.beforeEach(async ({ page }) => {
        demoPage = new DemoPage(page);
    });

    const editors = ['default', 'css-vars', 'theme', 'override'] as const;

    for (const editor of editors) {
        test(`should add footnote, save, and preview in ${editor} editor`, async () => {
            const footnoteText = `Test footnote content for ${editor} ${Date.now()}`;

            await demoPage.goto(editor);

            // Add footnote
            await demoPage.addFootnote();
            await demoPage.verifyFootnoteElements(editor);

            // Type content
            await demoPage.typeInFootnote(footnoteText);

            // Submit
            await demoPage.submit();

            // Preview
            await demoPage.goToPreview();

            // Verify
            await demoPage.verifyPreviewContent(footnoteText);
        });
    }
});
