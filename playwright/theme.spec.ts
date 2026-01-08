import { test } from "@playwright/test";
import { DemoPage } from "./demo-page";

test.describe("Theme Editor", () => {
    let demoPage: DemoPage;

    test.beforeEach(async ({ page }) => {
        demoPage = new DemoPage(page);
    });

    test("should add footnote, save, and preview in theme editor", async () => {
        const footnoteText = `Test footnote content for theme ${Date.now()}`;

        await demoPage.goto('theme');

        // Add footnote
        await demoPage.addFootnote();
        await demoPage.verifyFootnoteElements('theme');

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
