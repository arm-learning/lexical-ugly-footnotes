import type { Locator, Page } from "@playwright/test";

export class DemoPage {
    readonly page: Page;
    readonly footnoteButton: Locator;
    readonly submitButton: Locator;
    readonly editorTab: Locator;
    readonly previewTab: Locator;
    readonly mainEditor: Locator;

    constructor(page: Page) {
        this.page = page;
        // The footnote button has a SquarePlusIcon. We'll search for a button with an SVG inside.
        // Assuming it's the one in the toolbar.
        this.footnoteButton = page.locator('button[type="button"]').filter({ has: page.locator('svg') }).first();
        this.submitButton = page.getByRole("button", { name: "Submit" });
        this.editorTab = page.getByRole("link", { name: "Editor" });
        this.previewTab = page.getByRole("link", { name: "Preview" });
        // The main editor is the first contenteditable
        this.mainEditor = page.locator('[contenteditable="true"]').first();
    }

    async goto(demoType: 'default' | 'css-vars' | 'theme' | 'override' | 'hackernews' | 'nested') {
        const path = demoType === 'default' ? '/demo' : `/demo/${demoType}`;
        await this.page.goto(path);
    }

    async addFootnote() {
        await this.mainEditor.focus();
        // Click the footnote button
        await this.footnoteButton.click();

        // Wait for the nested editor to appear (which means a new contenteditable is added)
        // We expect at least 2 contenteditables now (main + footnote)
        await this.page.waitForFunction(() => document.querySelectorAll('[contenteditable="true"]').length > 1);
    }

    async typeInFootnote(text: string) {
        // The footnote editor is the second contenteditable (index 1)
        // This avoids relying on specific classes which might change in themes
        const footnoteEditor = this.page.locator('[contenteditable="true"]').nth(1);
        await footnoteEditor.fill(text);
    }

    async submit() {
        await this.submitButton.click();
        // Wait for success message
        await this.page.waitForSelector('text=Saved successfully', { timeout: 5000 });
    }

    async goToPreview() {
        await this.previewTab.click();
    }

    async verifyPreviewContent(text: string) {
        // In preview, the footnote content is rendered.
        // We need to check if the text exists in the preview area.
        await this.page.waitForSelector(`text=${text}`);
    }

    async verifyFootnoteElements(demoType: string) {
        if (demoType === 'theme') {
            // Theme replaces classes, so we can't look for .luf-block
            // But we can check if there's a sup element (order number)
            // or simply relying on the fact that addFootnote waited for the editor is enough.
            // But let's check for a sup element which is common structure
            await this.page.waitForSelector('sup');
        } else if (demoType === 'hackernews') {
            // HackerNews demo uses custom components with different classes
            await this.page.waitForSelector('.hn-block');
            await this.page.waitForSelector('.hn-reference');
        } else {
            // Check for presence of default footnote elements
            await this.page.waitForSelector('.luf-block');
            await this.page.waitForSelector('.luf-reference-sup');
        }
    }
}
