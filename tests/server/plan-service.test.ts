import { describe, it, expect } from "vitest";
import { EditKeyMismatchError, BudgetValidationError } from "@/lib/server/plan-service";

describe("EditKeyMismatchError", () => {
  it("has correct name", () => {
    const err = new EditKeyMismatchError();
    expect(err.name).toBe("EditKeyMismatchError");
  });

  it("has message", () => {
    const err = new EditKeyMismatchError();
    expect(err.message).toBe("Invalid edit key");
  });

  it("is an Error", () => {
    expect(new EditKeyMismatchError()).toBeInstanceOf(Error);
  });
});

describe("BudgetValidationError", () => {
  it("has correct name", () => {
    const err = new BudgetValidationError();
    expect(err.name).toBe("BudgetValidationError");
  });

  it("has message", () => {
    const err = new BudgetValidationError();
    expect(err.message).toBe("Invalid budget edit");
  });

  it("is an Error", () => {
    expect(new BudgetValidationError()).toBeInstanceOf(Error);
  });
});
