import { expect, test } from "@playwright/test";
import dotenv from "dotenv";
import { HomeViewPage } from "playwright/home-view-page";
import { ApiJobs } from "playwright/refresh-jobs-api";

dotenv.config({ path: ".env.development.local" });

test.describe("Home View", () => {
	let homeViewPage: HomeViewPage;

	test.beforeEach(async ({ page }) => {
		homeViewPage = new HomeViewPage(page);
		await homeViewPage.goto();
	});

	test("country selector", async ({ request }) => {
		const api = new ApiJobs(request);
		await api.refreshJobs();
		await homeViewPage.goto();

		await expect(await homeViewPage.isLoadingSpinnerNotVisible()).toBeHidden();
		await expect(await homeViewPage.isPageTitleVisible()).toBeVisible();
		await expect(await homeViewPage.isJobTableTitleVisible()).toBeVisible();
		await expect(
			await homeViewPage.isCountrySelectorInternationalSelected(),
		).toBeVisible();
		await homeViewPage.countrySelectorInternationalClick();
		await homeViewPage.countrySelectorOptionChinaClick();
		await expect(
			await homeViewPage.isTableFilterLoadingSpinnerVisible(),
		).toBeVisible();
		await expect(
			await homeViewPage.isTableFilterLoadingSpinnerNotVisible(),
		).toBeHidden();
		await expect(
			await homeViewPage.isCountrySelectorChinaSelected(),
		).toBeVisible();
		expect(await homeViewPage.getCountrySelectorUrl()).toContain(
			"country=china",
		);
		await homeViewPage.countrySelectorChinaClick();
		await homeViewPage.countrySelectorOptionSouthKoreaClick();
		await expect(
			await homeViewPage.isTableFilterLoadingSpinnerVisible(),
		).toBeVisible();
		await expect(
			await homeViewPage.isTableFilterLoadingSpinnerNotVisible(),
		).toBeHidden();

		await expect(
			await homeViewPage.isCountrySelectorSouthKoreaSelected(),
		).toBeVisible();
		expect(await homeViewPage.getCountrySelectorUrl()).toContain(
			"country=south_korea",
		);

		await homeViewPage.countrySelectorSouthKoreaClick();
		await homeViewPage.countrySelectorOptionInternationalClick();
		await expect(
			await homeViewPage.isTableFilterLoadingSpinnerVisible(),
		).toBeVisible();
		await expect(
			await homeViewPage.isTableFilterLoadingSpinnerNotVisible(),
		).toBeHidden();

		await expect(
			await homeViewPage.isCountrySelectorInternationalSelected(),
		).toBeVisible();
		expect(await homeViewPage.getCountrySelectorUrl()).toContain(
			"country=international",
		);
	});

	test("view test pro job", async ({ request }) => {
		const api = new ApiJobs(request);
		await api.refreshJobs();
		await homeViewPage.goto();
		await expect(await homeViewPage.isLoadingSpinnerNotVisible()).toBeHidden();
		await expect(await homeViewPage.isPageTitleVisible()).toBeVisible();
		await expect(await homeViewPage.isJobTableTitleVisible()).toBeVisible();

		await homeViewPage.clickTestJobProPreviewRowTitle();
		await expect(
			await homeViewPage.isTestJobProPageTitleVisible(),
		).toBeVisible();

		expect(await homeViewPage.getPageUrl()).toContain(
			"view/0196f57a-16cd-7336-8871-6ef410947f0d",
		);
		await homeViewPage.clickTestJobProPageCloseButton();
		expect(await homeViewPage.getPageUrl()).not.toContain(
			"view/0196f57a-16cd-7336-8871-6ef410947f0d",
		);
	});
});
