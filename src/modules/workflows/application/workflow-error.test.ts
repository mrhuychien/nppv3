import { describe, expect, it } from "vitest";

import { normalizeRpcError } from "@/modules/workflows/application/workflow-error";

describe("RPC error normalization", () => {
  it("keeps known compatibility error codes", () => {
    expect(normalizeRpcError("INSUFFICIENT_STOCK: product x, missing 2")).toBe(
      "INSUFFICIENT_STOCK",
    );
    expect(normalizeRpcError("ENTRY_STATE_INVALID: posted")).toBe(
      "ENTRY_STATE_INVALID",
    );
  });

  it("does not expose unknown database error messages", () => {
    expect(normalizeRpcError("relation internal_secret does not exist")).toBe(
      "RPC_FAILED",
    );
  });
});
