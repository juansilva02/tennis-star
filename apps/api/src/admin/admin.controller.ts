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
import { AdminService } from "./admin.service";
import { ReportingService } from "./reporting.service";
import { DiscountDto, NotificationDto, SettingsDto, UpdateDiscountDto, ReadNotificationDto } from "./admin.dto";
import { Public } from "../common/public.decorator";
@ApiTags("Administración")
@Controller()
export class AdminController {
  constructor(private s: AdminService, private reports: ReportingService) {}
  @Get("discounts") discounts(@Query() q: any) {
    return this.s.discounts(q);
  }
  @Post("discounts") async cd(@Body() d: DiscountDto) {
    return { data: await this.s.createDiscount(d) };
  }
  @Patch("discounts/:id") async ud(
    @Param("id") id: string,
    @Body() d: UpdateDiscountDto,
  ) {
    return { data: await this.s.updateDiscount(id, d) };
  }
  @Delete("discounts/:id") async dd(@Param("id") id: string) {
    return { data: await this.s.deleteDiscount(id) };
  }
  @Get("notifications") notifications(@Query() q: any) {
    return this.s.notifications(q);
  }
  @Post("notifications") async cn(@Body() d: NotificationDto) {
    return { data: await this.s.createNotification(d) };
  }
  @Patch("notifications/:id/read") async rn(
    @Param("id") id: string,
    @Body() d: ReadNotificationDto,
  ) {
    return { data: await this.s.readNotification(id, d.read) };
  }
  @Post("notifications/read-all") async ra() {
    return { data: await this.s.readAll() };
  }
  @Delete("notifications/:id") async dn(@Param("id") id: string) {
    return { data: await this.s.deleteNotification(id) };
  }
  @Get("settings") async settings() {
    return { data: await this.s.settings() };
  }
  @Patch("settings") async save(@Body() d: SettingsDto) {
    return { data: await this.s.saveSettings(d) };
  }
  @Get("dashboard") async dashboard() {
    return { data: await this.reports.dashboard() };
  }
  @Get("statistics") async stats(
    @Query("from") f?: string,
    @Query("to") t?: string,
  ) {
    return { data: await this.reports.statistics(f, t) };
  }
  @Public() @Get("health") health() {
    return this.reports.health();
  }
}
