import type { Locator, Page } from "@playwright/test";

export class ShowcasePage {
	private page: Page;
	private tabDefault: Locator;
	private tabCssVars: Locator;
	private tabTheme: Locator;
	private tabOverride: Locator;
	private editorDefault: Locator;
	private editorCssVars: Locator;
	private editorTheme: Locator;
	private editorOverride: Locator;
	private footnoteButton: Locator;
	private contentEditable: Locator;

	constructor(page: Page) {
		this.page = page;
		this.tabDefault = page.getByTestId("tab-default");
		this.tabCssVars = page.getByTestId("tab-css-vars");
		this.tabTheme = page.getByTestId("tab-theme");
		this.tabOverride = page.getByTestId("tab-override");
		this.editorDefault = page.getByTestId("editor-default");
		this.editorCssVars = page.getByTestId("editor-css-vars");
		this.editorTheme = page.getByTestId("editor-theme");
		this.editorOverride = page.getByTestId("editor-override");
		// Footnote button is a button with SquarePlusIcon, so we'll use a more generic selector
		this.footnoteButton = page.locator('button[type="button"]').filter({ has: page.locator('svg') }).first();
		this.contentEditable = page.locator('[contenteditable="true"]').first();
	}

	async goto() {
		await this.page.goto("/showcase");
	}

	async getPageUrl() {
		return this.page.url();
	}

	async clickTabDefault() {
		await this.tabDefault.click();
	}

	async clickTabCssVars() {
		await this.tabCssVars.click();
	}

	async clickTabTheme() {
		await this.tabTheme.click();
	}

	async clickTabOverride() {
		await this.tabOverride.click();
	}

	async isEditorDefaultVisible() {
		return this.editorDefault;
	}

	async isEditorCssVarsVisible() {
		return this.editorCssVars;
	}

	async isEditorThemeVisible() {
		return this.editorTheme;
	}

	async isEditorOverrideVisible() {
		return this.editorOverride;
	}

	async isTabDefaultActive() {
		return this.tabDefault;
	}

	async isTabCssVarsActive() {
		return this.tabCssVars;
	}

	async isTabThemeActive() {
		return this.tabTheme;
	}

	async isTabOverrideActive() {
		return this.tabOverride;
	}

	async clickFootnoteButton() {
		await this.footnoteButton.click();
	}

	async getCssVarValue(varName: string) {
		const element = this.page.locator(".showcase-editor-css-vars").first();
		return await element.evaluate((el, varName) => {
			return getComputedStyle(el).getPropertyValue(varName);
		}, varName);
	}

	async getBlockElement() {
		return this.page.locator(".luf-block").first();
	}

	async getReferenceElement() {
		return this.page.locator(".luf-reference-sup").first();
	}

	async getLineBreakElement() {
		return this.page.locator(".luf-linebreak").first();
	}

	async getBlockOrderElement() {
		return this.page.locator(".luf-block-order").first();
	}

	async getBlockEditorElement() {
		return this.page.locator(".luf-block-editor").first();
	}

	async getThemeBlockElement() {
		return this.page.locator(".showcase-block-container").first();
	}

	async getThemeReferenceElement() {
		return this.page.locator(".showcase-editor-theme .luf-reference-sup").first();
	}
}

