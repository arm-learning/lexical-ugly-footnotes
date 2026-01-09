import type { Locator, Page } from "@playwright/test";

export class DemoPage {
  readonly page: Page;
  readonly footnoteButton: Locator;
  readonly nestedEditorButton: Locator;
  readonly submitButton: Locator;
  readonly editorTab: Locator;
  readonly previewTab: Locator;
  readonly mainEditor: Locator;

  constructor(page: Page) {
    this.page = page;
    // The footnote button has a SquarePlusIcon. We'll search for a button with an SVG inside.
    // Assuming it's the one in the toolbar.
    this.footnoteButton = page
      .locator('button[type="button"]')
      .filter({ has: page.locator("svg") })
      .first();
    this.nestedEditorButton = page.getByRole("button", {
      name: "Nested Editor",
    });
    this.submitButton = page.getByRole("button", { name: "Submit" });
    this.editorTab = page.getByRole("link", { name: "Editor" });
    this.previewTab = page.getByRole("link", { name: "Preview" });
    // The main editor is the first contenteditable
    this.mainEditor = page.locator('[contenteditable="true"]').first();
  }

  async goto(
    demoType:
      | "default"
      | "css-vars"
      | "theme"
      | "override"
      | "hackernews"
      | "nested",
  ) {
    const path = demoType === "default" ? "/demo" : `/demo/${demoType}`;
    await this.page.goto(path);
  }

  async addFootnote() {
    // Track the count before adding
    const countBefore = await this.page
      .locator('[contenteditable="true"]')
      .count();

    await this.mainEditor.focus();
    // Click the footnote button
    await this.footnoteButton.click();

    // Wait for the new contenteditable to appear
    await this.page.waitForFunction(
      (before) =>
        document.querySelectorAll('[contenteditable="true"]').length > before,
      countBefore,
    );

    // Return the index of the newly added footnote editor (last one)
    const countAfter = await this.page
      .locator('[contenteditable="true"]')
      .count();
    return countAfter - 1;
  }

  async addNestedEditor() {
    const initialCount = await this.page
      .locator(".nested-footnote-demo-wrapper")
      .count();
    await this.mainEditor.focus();
    await this.nestedEditorButton.click();
    // Wait for new nested editor wrapper to appear
    await this.page.waitForFunction(
      (initial) =>
        document.querySelectorAll(".nested-footnote-demo-wrapper").length >
        initial,
      initialCount,
    );
    // Also wait for the contenteditable to be present inside the new wrapper
    // We know the new one is the last one
    const lastWrapper = this.page
      .locator(".nested-footnote-demo-wrapper")
      .last();
    await lastWrapper.getByRole("textbox").waitFor({ state: "visible" });
  }

  async typeInNestedEditor(text: string, index = 0) {
    // Use global contenteditable index.
    // Index 0 = Main Editor.
    // Index 1 = First Nested Editor.
    // Index 2 = Second Nested Editor (if added via addNestedEditor).
    // So we target index + 1.
    const targetIndex = index + 1;
    const nestedEditor = this.page
      .locator('[contenteditable="true"]')
      .nth(targetIndex);
    await nestedEditor.waitFor({ state: "visible" });
    await nestedEditor.click();
    await nestedEditor.fill(text);
  }

  async addNestedFootnote(nestedEditorIndex = 0) {
    // Focus the specific nested editor
    const targetIndex = nestedEditorIndex + 1;
    const nestedEditor = this.page
      .locator('[contenteditable="true"]')
      .nth(targetIndex);
    await nestedEditor.focus();

    // Click the footnote button.
    await this.footnoteButton.click();
  }

  async typeInNestedFootnote(text: string, nestedEditorIndex = 0) {
    // When a footnote is added inside a nested editor, it creates a new contenteditable *inside* that nested editor structure?
    // Or does it use the main mechanism?
    // Based on `NestedFootnotePlugin`, it seems to handle it.
    // The footnote editor usually appears as another contenteditable.
    // We need to find the specific footnote editor that belongs to the nested editor action.
    // Usually, the latest focused editor's footnote will be the last one added or specific to the context.
    // Let's assume it behaves like the main one but we might need to be careful with locating it.
    // Helper: just type in the LAST contenteditable on the page, as usually the newly opened footnote (if inline) or popover is the last one.
    // However, if footnotes are inline blocks, we need to find the one inside the nested editor?
    // Let's look at `index.ts` existing `typeInFootnote`: uses `.nth(1)`.

    // If we have: Main Editor, Nested Editor 1, Nested Editor 2.
    // Adding footnote in Nested Editor 2 -> creates Footnote Editor.
    // So we should look for the last contenteditable, or specific relation.

    const allEditors = this.page.locator('[contenteditable="true"]');
    const count = await allEditors.count();
    // The new footnote editor should be the last one?
    const footnoteEditor = allEditors.nth(count - 1);
    await footnoteEditor.fill(text);
  }

  async typeInFootnote(text: string) {
    // The footnote editor is the most recently added contenteditable
    // When multiple footnotes exist, the last one is the newly added one
    const allEditors = this.page.locator('[contenteditable="true"]');
    const count = await allEditors.count();
    const footnoteEditor = allEditors.nth(count - 1);
    await footnoteEditor.fill(text);
  }

  async submit() {
    await this.submitButton.click();
    // Wait for success message
    await this.page.waitForSelector("text=Saved successfully", {
      timeout: 5000,
    });
  }

  async goToPreview() {
    await this.previewTab.click();
  }

  async verifyPreviewContent(text: string) {
    // In preview, the footnote content is rendered.
    // We need to check if the text exists in the preview area.
    await this.page.waitForSelector(`text=${text}`);
  }

  async moveToNewLine() {
    // Get the last footnote's contenteditable and use arrow keys to exit it
    const allEditors = this.page.locator('[contenteditable="true"]');
    const count = await allEditors.count();
    const lastEditor = allEditors.nth(count - 1);

    // Click at end of the last editor (which is the footnote we just typed in)
    await lastEditor.focus();
    await lastEditor.press("End");
    // Press ArrowRight to move out of the footnote block
    await lastEditor.press("ArrowRight");
    // Press Enter to create a new paragraph in the main editor
    await this.page.keyboard.press("Enter");
  }

  async verifyFootnoteElements(demoType: string) {
    if (demoType === "theme") {
      // Theme replaces classes, so we can't look for .luf-block
      // But we can check if there's a sup element (order number)
      // or simply relying on the fact that addFootnote waited for the editor is enough.
      // But let's check for a sup element which is common structure
      await this.page.waitForSelector("sup");
    } else if (demoType === "hackernews") {
      // HackerNews demo uses custom components with different classes
      await this.page.waitForSelector(".hn-block");
      await this.page.waitForSelector(".hn-reference");
    } else {
      // Check for presence of default footnote elements
      await this.page.waitForSelector(".luf-block");
      await this.page.waitForSelector(".luf-reference-sup");
    }
  }
}
