import type { Locator, Page } from "@playwright/test";

export class ShowcasePreviewPage {
	private page: Page;
	private tabDefault: Locator;
	private tabCssVars: Locator;
	private tabTheme: Locator;
	private tabOverride: Locator;
	private previewDefault: Locator;
	private previewCssVars: Locator;
	private previewTheme: Locator;
	private previewOverride: Locator;

	constructor(page: Page) {
		this.page = page;
		this.tabDefault = page.getByTestId("preview-tab-default");
		this.tabCssVars = page.getByTestId("preview-tab-css-vars");
		this.tabTheme = page.getByTestId("preview-tab-theme");
		this.tabOverride = page.getByTestId("preview-tab-override");
		this.previewDefault = page.getByTestId("preview-default");
		this.previewCssVars = page.getByTestId("preview-css-vars");
		this.previewTheme = page.getByTestId("preview-theme");
		this.previewOverride = page.getByTestId("preview-override");
	}

	async goto() {
		await this.page.goto("/showcase/preview");
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

	async isPreviewDefaultVisible() {
		return this.previewDefault;
	}

	async isPreviewCssVarsVisible() {
		return this.previewCssVars;
	}

	async isPreviewThemeVisible() {
		return this.previewTheme;
	}

	async isPreviewOverrideVisible() {
		return this.previewOverride;
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

	async getCssVarValue(varName: string) {
		const element = this.page.locator('[data-testid="preview-css-vars"]').first();
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
}

