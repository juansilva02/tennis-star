import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { ReportingService } from "./reporting.service";
@Module({ controllers: [AdminController], providers: [AdminService, ReportingService] })
export class AdminModule {}
