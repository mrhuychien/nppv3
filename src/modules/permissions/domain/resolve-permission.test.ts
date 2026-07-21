import { describe, expect, it } from "vitest";

import { resolvePermission } from "@/modules/permissions/domain/resolve-permission";

const defaults = {
  sales: ["orders.read", "orders.create"],
} as const;

describe("permission precedence", () => {
  it("always grants owner", () => {
    expect(
      resolvePermission({
        role: "owner",
        key: "settings.delete",
        userOverride: false,
        roleOverride: false,
        defaults,
      }),
    ).toBe(true);
  });

  it("lets user override win over role override", () => {
    expect(
      resolvePermission({
        role: "sales",
        key: "orders.read",
        userOverride: false,
        roleOverride: true,
        defaults,
      }),
    ).toBe(false);
  });

  it("falls back to the role defaults", () => {
    expect(
      resolvePermission({ role: "sales", key: "orders.create", defaults }),
    ).toBe(true);
  });
});
