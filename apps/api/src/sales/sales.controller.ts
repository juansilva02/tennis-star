import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  CreateSaleDto,
  PreviewSaleDiscountDto,
  UpdateSaleDto,
  SaleOptionsQueryDto,
} from "./sales.dto";
import { SalesService } from "./sales.service";
@ApiTags("Ventas")
@Controller("sales")
export class SalesController {
  constructor(private s: SalesService) {}
  @Get("options/customers") customers(@Query() q: SaleOptionsQueryDto) {
    return this.s.customerOptions(q);
  }
  @Get("options/products") products(@Query() q: SaleOptionsQueryDto) {
    return this.s.productOptions(q);
  }
  @Get("summary/today") async todaySummary() {
    return { data: await this.s.todaySummary() };
  }
  @Get() list(@Query() q: any) {
    return this.s.list(q);
  }
  @Get(":id") async detail(@Param("id") id: string) {
    return { data: await this.s.detail(id) };
  }
  @Post() async create(@Body() d: CreateSaleDto) {
    return { data: await this.s.create(d) };
  }
  @Post("discounts/preview") async previewDiscount(
    @Body() d: PreviewSaleDiscountDto,
  ) {
    return { data: await this.s.previewDiscount(d) };
  }
  @Patch(":id") async update(
    @Param("id") id: string,
    @Body() d: UpdateSaleDto,
  ) {
    return { data: await this.s.update(id, d) };
  }
  @Delete(":id") async hide(@Param("id") id: string) {
    return { data: await this.s.hide(id) };
  }
  @Post(":id/restore") async restore(@Param("id") id: string) {
    return { data: await this.s.hide(id, true) };
  }
}
