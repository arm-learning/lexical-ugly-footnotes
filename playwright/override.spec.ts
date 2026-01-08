import { test } from "@playwright/test";
import { DemoPage } from "./demo-page";

test.describe("Override Editor", () => {
    let demoPage: DemoPage;

    test.beforeEach(async ({ page }) => {
        demoPage = new DemoPage(page);
    });

    test("should add footnote, save, and preview in override editor", async () => {
        const footnoteText = `Test footnote content for override ${Date.now()}`;

        await demoPage.goto('override');

        // Add footnote
        await demoPage.addFootnote();
        await demoPage.verifyFootnoteElements('override');

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
