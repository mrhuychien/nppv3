import { describe, expect, it } from "vitest";

import {
  DRIVER_DELIVERY_WORKFLOW,
  SELF_DELIVERY_WORKFLOW,
  workflowForRail,
} from "@/modules/fulfillment/domain/fulfillment-workflow";

describe("fulfillment rails", () => {
  it("keeps self delivery on the stock-out rail", () => {
    expect(SELF_DELIVERY_WORKFLOW[1]?.atomicOperation).toBe(
      "create_stock_out_bundle",
    );
    expect(
      SELF_DELIVERY_WORKFLOW.some((step) =>
        step.invariants.includes("stock-deducted-once"),
      ),
    ).toBe(true);
  });

  it("keeps driver delivery independent from stock entries", () => {
    expect(DRIVER_DELIVERY_WORKFLOW[0]?.invariants).toContain(
      "no-stock-entry-created",
    );
    expect(workflowForRail("driver_delivery")).toBe(DRIVER_DELIVERY_WORKFLOW);
  });

  it("requires handover before collecting or settling", () => {
    const selfStages = SELF_DELIVERY_WORKFLOW.map((step) => step.stage);
    const driverStages = DRIVER_DELIVERY_WORKFLOW.map((step) => step.stage);

    expect(selfStages.indexOf("in_transit")).toBeLessThan(
      selfStages.indexOf("collecting"),
    );
    expect(driverStages.indexOf("in_transit")).toBeLessThan(
      driverStages.indexOf("settling"),
    );
  });
});
