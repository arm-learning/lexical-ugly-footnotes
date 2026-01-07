import { test } from "@playwright/test";
import { DemoPage } from "./demo-page";

test.describe("Default Editor", () => {
    let demoPage: DemoPage;

    test.beforeEach(async ({ page }) => {
        demoPage = new DemoPage(page);
    });

    test("should add footnote, save, and preview in default editor", async () => {
        const footnoteText = `Test footnote content for default ${Date.now()}`;

        await demoPage.goto('default');

        // Add footnote
        await demoPage.addFootnote();
        await demoPage.verifyFootnoteElements('default');

        // Type content
        await demoPage.typeInFootnote(footnoteText);

        // Submit
        await demoPage.submit();

        // Preview
        await demoPage.goToPreview();

        // Verify
        await demoPage.verifyPreviewContent(footnoteText);
    });
});
