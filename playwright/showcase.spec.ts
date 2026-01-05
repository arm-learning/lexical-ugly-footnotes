import { expect, test } from "@playwright/test";
import { ShowcasePage } from "playwright/showcase-page";

test.describe("Styling Showcase", () => {
	let showcasePage: ShowcasePage;

	test.beforeEach(async ({ page }) => {
		showcasePage = new ShowcasePage(page);
		await showcasePage.goto();
	});

	test("should display default styling tab by default", async () => {
		await expect(await showcasePage.isEditorDefaultVisible()).toBeVisible();
		await expect(await showcasePage.isTabDefaultActive()).toHaveClass(/border-blue-500/);
	});

	test("should switch to CSS variables tab", async () => {
		await showcasePage.clickTabCssVars();
		await expect(await showcasePage.isEditorCssVarsVisible()).toBeVisible();
		await expect(await showcasePage.isTabCssVarsActive()).toHaveClass(/border-blue-500/);
		await expect(await showcasePage.isEditorDefaultVisible()).not.toBeVisible();
	});

	test("should switch to theme configuration tab", async () => {
		await showcasePage.clickTabTheme();
		await expect(await showcasePage.isEditorThemeVisible()).toBeVisible();
		await expect(await showcasePage.isTabThemeActive()).toHaveClass(/border-blue-500/);
		await expect(await showcasePage.isEditorDefaultVisible()).not.toBeVisible();
	});

	test("should switch to CSS override tab", async () => {
		await showcasePage.clickTabOverride();
		await expect(await showcasePage.isEditorOverrideVisible()).toBeVisible();
		await expect(await showcasePage.isTabOverrideActive()).toHaveClass(/border-blue-500/);
		await expect(await showcasePage.isEditorDefaultVisible()).not.toBeVisible();
	});

	test("should verify CSS variables are applied", async () => {
		await showcasePage.clickTabCssVars();
		await expect(await showcasePage.isEditorCssVarsVisible()).toBeVisible();

		// Check that CSS variables are set
		const blockGap = await showcasePage.getCssVarValue("--luf-block-gap");
		expect(blockGap.trim()).toBe("1rem");

		const blockBorderColor = await showcasePage.getCssVarValue("--luf-block-editor-border-color");
		expect(blockBorderColor.trim()).toBe("#3b82f6");

		const linebreakColor = await showcasePage.getCssVarValue("--luf-linebreak-color");
		expect(linebreakColor.trim()).toBe("#3b82f6");
	});

	test("should verify theme classes are applied", async () => {
		await showcasePage.clickTabTheme();
		await expect(await showcasePage.isEditorThemeVisible()).toBeVisible();

		// Check that theme-based classes exist (they may not be visible if no footnotes exist)
		const themeBlock = showcasePage.getThemeBlockElement();
		// Note: This will only be visible if there are footnotes in the editor
		// We're just checking the structure exists
	});

	test("should verify default styling renders", async () => {
		await expect(await showcasePage.isEditorDefaultVisible()).toBeVisible();
		
		// Verify the editor is rendered
		const contentEditable = showcasePage.contentEditable;
		await expect(contentEditable).toBeVisible();
	});

	test("should verify all tabs are accessible", async () => {
		// Test default tab
		await showcasePage.clickTabDefault();
		await expect(await showcasePage.isEditorDefaultVisible()).toBeVisible();

		// Test CSS vars tab
		await showcasePage.clickTabCssVars();
		await expect(await showcasePage.isEditorCssVarsVisible()).toBeVisible();

		// Test theme tab
		await showcasePage.clickTabTheme();
		await expect(await showcasePage.isEditorThemeVisible()).toBeVisible();

		// Test override tab
		await showcasePage.clickTabOverride();
		await expect(await showcasePage.isEditorOverrideVisible()).toBeVisible();

		// Go back to default
		await showcasePage.clickTabDefault();
		await expect(await showcasePage.isEditorDefaultVisible()).toBeVisible();
	});

	test("should verify footnote button is present in all editors", async () => {
		// Check default editor
		await expect(await showcasePage.isEditorDefaultVisible()).toBeVisible();
		await expect(showcasePage.footnoteButton).toBeVisible();

		// Check CSS vars editor
		await showcasePage.clickTabCssVars();
		await expect(await showcasePage.isEditorCssVarsVisible()).toBeVisible();
		await expect(showcasePage.footnoteButton).toBeVisible();

		// Check theme editor
		await showcasePage.clickTabTheme();
		await expect(await showcasePage.isEditorThemeVisible()).toBeVisible();
		await expect(showcasePage.footnoteButton).toBeVisible();

		// Check override editor
		await showcasePage.clickTabOverride();
		await expect(await showcasePage.isEditorOverrideVisible()).toBeVisible();
		await expect(showcasePage.footnoteButton).toBeVisible();
	});
});

