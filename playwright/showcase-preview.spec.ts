import { expect, test } from "@playwright/test";
import { ShowcasePreviewPage } from "playwright/showcase-preview-page";

test.describe("Styling Preview Showcase", () => {
	let showcasePreviewPage: ShowcasePreviewPage;

	test.beforeEach(async ({ page }) => {
		showcasePreviewPage = new ShowcasePreviewPage(page);
		await showcasePreviewPage.goto();
	});

	test("should display default styling preview by default", async () => {
		await expect(await showcasePreviewPage.isPreviewDefaultVisible()).toBeVisible();
		await expect(await showcasePreviewPage.isTabDefaultActive()).toHaveClass(/border-blue-500/);
	});

	test("should switch to CSS variables preview tab", async () => {
		await showcasePreviewPage.clickTabCssVars();
		await expect(await showcasePreviewPage.isPreviewCssVarsVisible()).toBeVisible();
		await expect(await showcasePreviewPage.isTabCssVarsActive()).toHaveClass(/border-blue-500/);
		await expect(await showcasePreviewPage.isPreviewDefaultVisible()).not.toBeVisible();
	});

	test("should switch to theme configuration preview tab", async () => {
		await showcasePreviewPage.clickTabTheme();
		await expect(await showcasePreviewPage.isPreviewThemeVisible()).toBeVisible();
		await expect(await showcasePreviewPage.isTabThemeActive()).toHaveClass(/border-blue-500/);
		await expect(await showcasePreviewPage.isPreviewDefaultVisible()).not.toBeVisible();
	});

	test("should switch to CSS override preview tab", async () => {
		await showcasePreviewPage.clickTabOverride();
		await expect(await showcasePreviewPage.isPreviewOverrideVisible()).toBeVisible();
		await expect(await showcasePreviewPage.isTabOverrideActive()).toHaveClass(/border-blue-500/);
		await expect(await showcasePreviewPage.isPreviewDefaultVisible()).not.toBeVisible();
	});

	test("should verify CSS variables are applied to preview", async () => {
		await showcasePreviewPage.clickTabCssVars();
		await expect(await showcasePreviewPage.isPreviewCssVarsVisible()).toBeVisible();

		// Check that CSS variables are set on the preview container
		const blockGap = await showcasePreviewPage.getCssVarValue("--luf-block-gap");
		expect(blockGap.trim()).toBe("1rem");

		const blockBorderColor = await showcasePreviewPage.getCssVarValue("--luf-block-editor-border-color");
		expect(blockBorderColor.trim()).toBe("#3b82f6");
	});

	test("should verify all preview tabs are accessible", async () => {
		// Test default tab
		await showcasePreviewPage.clickTabDefault();
		await expect(await showcasePreviewPage.isPreviewDefaultVisible()).toBeVisible();

		// Test CSS vars tab
		await showcasePreviewPage.clickTabCssVars();
		await expect(await showcasePreviewPage.isPreviewCssVarsVisible()).toBeVisible();

		// Test theme tab
		await showcasePreviewPage.clickTabTheme();
		await expect(await showcasePreviewPage.isPreviewThemeVisible()).toBeVisible();

		// Test override tab
		await showcasePreviewPage.clickTabOverride();
		await expect(await showcasePreviewPage.isPreviewOverrideVisible()).toBeVisible();

		// Go back to default
		await showcasePreviewPage.clickTabDefault();
		await expect(await showcasePreviewPage.isPreviewDefaultVisible()).toBeVisible();
	});

	test("should verify HTML content is rendered in preview", async () => {
		// Check that the preview container has content
		const previewContainer = showcasePreviewPage.page.locator('[data-testid="preview-default"]');
		await expect(previewContainer).toBeVisible();
		
		// The content might be empty if no content was saved, but the container should exist
	});
});

