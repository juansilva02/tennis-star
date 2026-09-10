import { BadRequestException } from "@nestjs/common";
import { discountDate } from "../common/discount-dates";
import { AdminService } from "./admin.service";

describe("Vigencia de descuentos", () => {
  it("incluye todo el último día argentino", () => {
    expect(discountDate("2026-09-10", true)?.toISOString()).toBe("2026-09-11T02:59:59.999Z");
    expect(discountDate("2026-09-10")?.toISOString()).toBe("2026-09-10T03:00:00.000Z");
    expect(discountDate(null, true)).toBeNull();
  });
  it("rechaza períodos invertidos antes de guardar", () => {
    const service = new AdminService({} as never);
    expect(() => service.createDiscount({ name: "Inválido", code: "TEST", type: "FIXED", value: 10, startsAt: "2026-09-12", endsAt: "2026-09-10" })).toThrow(BadRequestException);
  });
});
