import { test } from "@playwright/test";
import { DemoPage } from "./demo-page";

test.describe("Hacker News Editor", () => {
  let demoPage: DemoPage;

  test.beforeEach(async ({ page }) => {
    demoPage = new DemoPage(page);
  });

  test("should add footnote, save, and preview in hackernews editor", async () => {
    const footnoteText = `Test footnote content for hackernews ${Date.now()}`;

    await demoPage.goto("hackernews");

    // Add footnote
    await demoPage.addFootnote();
    // Use generic verification or specific if known. defaulting to standard check
    // If this fails, we will need to update verifyFootnoteElements
    await demoPage.verifyFootnoteElements("hackernews");

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
