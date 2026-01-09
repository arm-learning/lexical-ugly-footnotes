import { test } from "@playwright/test";
import { DemoPage } from "./demo-page";

test.describe("CSS Variables Editor", () => {
  let demoPage: DemoPage;

  test.beforeEach(async ({ page }) => {
    demoPage = new DemoPage(page);
  });

  test("should add footnote, save, and preview in css-vars editor", async () => {
    const footnoteText = `Test footnote content for css-vars ${Date.now()}`;

    await demoPage.goto("css-vars");

    // Add footnote
    await demoPage.addFootnote();
    await demoPage.verifyFootnoteElements("css-vars");

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
