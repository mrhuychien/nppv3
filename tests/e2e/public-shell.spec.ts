import { expect, test } from "@playwright/test";

test("landing page opens the login workflow", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Viết mới nền tảng. Giữ nguyên nghiệp vụ đã chạy." }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Đăng nhập" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Đăng nhập" })).toBeVisible();
  await expect(page.getByLabel("Tài khoản")).toBeVisible();
  await expect(page.getByLabel("Mật khẩu")).toBeVisible();
});

test("health endpoint exposes a stable readiness payload", async ({ request }) => {
  const response = await request.get("/health");

  expect(response.ok()).toBe(true);
  await expect(response.json()).resolves.toEqual({ status: "ok", service: "nppv3" });
});
