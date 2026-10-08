import { describe, expect, it } from "vitest";
import { deliveryLabel } from "./interview-email-history";

describe("email delivery evidence", () => {
  it("does not present provider acceptance as delivery", () => {
    expect(deliveryLabel("accepted")).toBe("Accepted by email service");
    expect(deliveryLabel("sent")).toBe("Sent — delivery unconfirmed");
  });
  it("shows delivery only when the provider confirms it", () => {
    expect(deliveryLabel("delivered")).toBe("Delivered");
    expect(deliveryLabel("unrecognised")).toBe("Delivery unconfirmed");
  });
});