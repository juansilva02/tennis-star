import { describe, expect, it } from "vitest";
import { money } from "./utils";

describe("formato monetario", () => {
  it("identifica los importes como dólares en español argentino", () => {
    expect(money.format(1299)).toMatch(/US\$|USD/);
  });
});
