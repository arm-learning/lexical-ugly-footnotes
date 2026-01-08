import { test } from "@playwright/test";
import { DemoPage } from "./demo-page";

test.describe("Nested Editor", () => {
    let demoPage: DemoPage;

    test.beforeEach(async ({ page }) => {
        demoPage = new DemoPage(page);
    });

    test("should add footnote, save, and preview in nested editor", async () => {
        const footnoteText = `Test footnote content for nested ${Date.now()}`;

        await demoPage.goto('nested');

        // Add footnote
        await demoPage.addFootnote();
        await demoPage.verifyFootnoteElements('nested');

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
