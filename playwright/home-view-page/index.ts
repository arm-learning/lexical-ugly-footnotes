import type { Locator, Page } from "@playwright/test";

export class HomeViewPage {
	private page: Page;
	private countrySelector: Locator;
	private countrySelectorOptionInternational: Locator;
	private countrySelectorOptionSouthKorea: Locator;
	private countrySelectorOptionChina: Locator;
	private countrySelectorChina: Locator;
	private countrySelectorSouthKorea: Locator;
	private nextPageButton: Locator;
	private previousPageButton: Locator;
	private jobTitleCell: Locator;
	private jobPostedAtCell: Locator;
	private jobPreviewPageCloseButton: Locator;
	private blogLink: Locator;
	private blogSplashLink: Locator;
	private termsLink: Locator;
	private privacyLink: Locator;
	private cookiesLink: Locator;
	private cookiesBannerAcceptButton: Locator;
	private faqLink: Locator;
	private aboutLink: Locator;
	private tablePagination: Locator;
	private loadingSpinner: Locator;
	private tableFilterLoadingSpinner: Locator;
	private jobTableTitle: Locator;
	private pageTitle: Locator;
	private testJobProRowTitle: Locator;
	private testJobNormalRowTitle: Locator;
	private testJobProPageTitle: Locator;
	private defaultProJobPostJobTitle: Locator;
	private testJobProPageCloseButton: Locator;

	constructor(page: Page) {
		this.page = page;
		this.countrySelector = page.getByText("International");
		this.countrySelectorChina = page.getByText("China");
		this.countrySelectorSouthKorea = page.getByText("South Korea");
		this.countrySelectorOptionInternational = page.getByRole("option", {
			name: "International",
		});
		this.countrySelectorOptionSouthKorea = page.getByRole("option", {
			name: "South Korea",
		});
		this.countrySelectorOptionChina = page.getByRole("option", {
			name: "China",
		});
		this.nextPageButton = page.getByRole("button", {
			name: "Next",
			exact: true,
		});
		this.previousPageButton = page.getByRole("button", {
			name: "Previous",
			exact: true,
		});
		this.jobTitleCell = page.getByRole("cell", { name: "A Passage to India" });
		this.jobPostedAtCell = page
			.getByRole("row", { name: "Peter Pan Not Listed Not Listed" })
			.getByRole("cell")
			.nth(2);
		this.jobPreviewPageCloseButton = page
			.locator("div")
			.filter({ hasText: /^Close$/ })
			.getByRole("button");
		this.blogLink = page.getByText("Blog", { exact: true });
		this.blogSplashLink = page.getByText("Blog →");
		this.termsLink = page.getByRole("link", { name: "Terms" });
		this.privacyLink = page.getByRole("link", { name: "Privacy" });
		this.cookiesLink = page.getByRole("link", { name: "Cookies" });
		this.cookiesBannerAcceptButton = page.getByRole("button", {
			name: "Got it",
		});
		this.faqLink = page.getByRole("link", { name: "FAQ" });
		this.aboutLink = page.getByRole("link", { name: "About" });
		this.tablePagination = page.getByTestId("table-pagination");
		this.loadingSpinner = page.getByTestId("table-jobs-loading-spinner");
		this.tableFilterLoadingSpinner = page.getByTestId(
			"table-filter-loading-spinner",
		);
		this.jobTableTitle = page.getByRole("cell", { name: "Job Details" });
		this.pageTitle = page
			.locator("div")
			.filter({ hasText: /^HomeBlogTeaching Jobs AbroadEnglishLogin$/ })
			.getByRole("heading");
		this.testJobProRowTitle = page.getByRole("cell", {
			name: "Test Job Pro",
			exact: true,
		});
		this.testJobNormalRowTitle = page.getByRole("cell", {
			name: "Test Job Normal",
			exact: true,
		});
		this.testJobProPageTitle = page.getByRole("heading", {
			name: "Test Job Pro",
		});
		this.defaultProJobPostJobTitle = page.getByText("Default Title");
		this.testJobProPageCloseButton = page
			.locator("div")
			.filter({ hasText: /^Close$/ })
			.getByRole("button");
	}

	async goto() {
		await this.page.goto("/");
	}
	async getPageUrl() {
		return this.page.url();
	}

	async isJobTableTitleVisible() {
		return this.jobTableTitle;
	}

	async isPageTitleVisible() {
		return this.pageTitle;
	}
	async isOnHomeViewPage() {
		return this.page.url().endsWith("/en");
	}

	async isTableFilterLoadingSpinnerVisible() {
		return this.tableFilterLoadingSpinner;
	}

	async isTableFilterLoadingSpinnerNotVisible() {
		return this.tableFilterLoadingSpinner;
	}
	async isCountrySelectorInternationalSelected() {
		// return this.countrySelector.isVisible();
		return this.countrySelector;
	}

	async countrySelectorInternationalClick() {
		await this.countrySelector.click();
	}

	async countrySelectorSouthKoreaClick() {
		await this.countrySelectorSouthKorea.click();
	}

	async countrySelectorChinaClick() {
		await this.countrySelectorChina.click();
	}

	async countrySelectorOptionSouthKoreaClick() {
		await this.countrySelectorOptionSouthKorea.click();
	}

	async countrySelectorOptionChinaClick() {
		await this.countrySelectorOptionChina.click();
	}

	async countrySelectorOptionInternationalClick() {
		await this.countrySelectorOptionInternational.click();
	}

	async getCountrySelectorUrl() {
		return this.page.url();
	}

	// async isCountrySelectorSouthKoreaVisible() {
	//     return this.countrySelectorSouthKorea.isVisible();
	// }

	// async isCountrySelectorChinaVisible() {
	//     return this.countrySelectorChina.isVisible();
	// }

	async isCountrySelectorSouthKoreaSelected() {
		return this.countrySelectorSouthKorea;
	}

	async isCountrySelectorChinaSelected() {
		return this.countrySelectorChina;
	}

	async getJobTitleCell() {
		return this.jobTitleCell.textContent();
	}

	async isPaginationVisible() {
		return this.tablePagination;
	}

	async clickNextPageButton() {
		await this.nextPageButton.click();
	}

	async clickPreviousPageButton() {
		await this.previousPageButton.click();
	}

	async isPreviousPageButtonDisabled() {
		return this.previousPageButton.isDisabled();
	}

	async isNextPageButtonDisabled() {
		return this.nextPageButton.isDisabled();
	}

	async getPaginationText() {
		return this.tablePagination.textContent();
	}

	async isLoadingSpinnerVisible() {
		return this.loadingSpinner;
	}

	async isLoadingSpinnerNotVisible() {
		return this.loadingSpinner;
	}

	async isTestJobProPageTitleVisible() {
		return this.testJobProPageTitle;
	}
	// async clickTestJobProPageTitle() {
	//     await this.testJobProPageTitle.click();
	// }

	// async isDefaultProJobPostJobTitleVisible() {
	//     return this.defaultProJobPostJobTitle;
	// }
	async clickTestJobProPageCloseButton() {
		await this.testJobProPageCloseButton.click();
	}
	async clickTestJobProPreviewRowTitle() {
		await this.testJobProRowTitle.click();
	}
	async clickTestJobNormalPreviewRowTitle() {
		await this.testJobNormalRowTitle.click();
	}
}

// job url
// http://localhost:3000/en/view/019719fb-2eb0-76a2-b113-a06d9cfabdbe

// pagination
// http://localhost:3000/en?table_filter_page=2

// country selector
// http://localhost:3000/en?country=china
// http://localhost:3000/en?country=south_korea

// job pro
// http://localhost:3000/en/view/0196f57a-16cd-7336-8871-6ef410947f0d
