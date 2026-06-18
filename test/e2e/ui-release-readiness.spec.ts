import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", heading: "Whitelisted stablecoin issuance and settlement workflow", name: "home" },
  { path: "/demo", heading: "End-to-end stablecoin operations walkthrough", name: "demo" },
  { path: "/admin", heading: "Operations control panel", name: "admin" },
  { path: "/company", heading: "Harbor Components workspace", name: "company" },
  { path: "/status", heading: "Monitoring and security readiness", name: "status" },
];

const forbiddenClaims = [
  /public RMB stablecoin/i,
  /public CNH stablecoin/i,
  /production payment system/i,
  /real customer funds system/i,
  /mainnet deployment path is active/i,
];

test.describe("UI release readiness", () => {
  for (const route of routes) {
    test(`${route.name} route loads with safety boundary`, async ({ page }, testInfo) => {
      const consoleErrors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") {
          consoleErrors.push(message.text());
        }
      });
      page.on("pageerror", (error) => {
        consoleErrors.push(error.message);
      });

      await page.goto(route.path);
      await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();
      await expect(page.getByText("Testnet-only demo. Mock assets only.")).toBeVisible();
      await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();

      for (const link of ["Demo Flow", "Admin", "Company", "System Status"]) {
        await expect(page.getByRole("link", { name: link })).toBeVisible();
      }

      const bodyText = await page.locator("body").innerText();
      for (const claim of forbiddenClaims) {
        expect(bodyText).not.toMatch(claim);
      }

      expect(consoleErrors).toEqual([]);

      await page.screenshot({
        fullPage: true,
        path: `docs/ui-screenshots/${testInfo.project.name}-${route.name}.png`,
      });
    });
  }

  test("primary navigation reaches every route", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Demo Flow" }).click();
    await expect(page).toHaveURL(/\/demo$/);

    await page.getByRole("link", { name: "Admin" }).click();
    await expect(page).toHaveURL(/\/admin$/);

    await page.getByRole("link", { name: "Company" }).click();
    await expect(page).toHaveURL(/\/company$/);

    await page.getByRole("link", { name: "System Status" }).click();
    await expect(page).toHaveURL(/\/status$/);
  });

  test("admin dashboard shows enterprise review concepts", async ({ page }) => {
    await page.goto("/admin");

    await expect(page.getByRole("heading", { name: "Enterprise Review Rails" })).toBeVisible();
    await expect(page.getByText("Risk case triage")).toBeVisible();
    await expect(page.getByText("Ledger reconciliation")).toBeVisible();
    await expect(page.getByText("Audit coverage")).toBeVisible();
    await expect(page.getByText("Read-only controls")).toBeVisible();
  });

  test("company dashboard shows pilot participation boundaries", async ({ page }) => {
    await page.goto("/company");

    await expect(page.getByRole("heading", { name: "Pilot Participation" })).toBeVisible();
    await expect(page.getByText("Participant boundary")).toBeVisible();
    await expect(page.getByText("Operator handoff")).toBeVisible();
    await expect(page.getByText("Support path")).toBeVisible();
    await expect(page.getByText("No self-service actions")).toBeVisible();
  });
});
