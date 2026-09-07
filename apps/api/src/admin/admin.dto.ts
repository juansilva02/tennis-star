import { DiscountType, NotificationType } from "@prisma/client";
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
export class DiscountDto {
  @IsString() name: string;
  @IsString() code: string;
  @IsEnum(DiscountType) type: DiscountType;
  @IsNumber() @Min(0) value: number;
  @IsOptional() @IsDateString() startsAt?: string;
  @IsOptional() @IsDateString() endsAt?: string;
  @IsOptional() @IsBoolean() active?: boolean;
}
export class NotificationDto {
  @IsString() title: string;
  @IsString() message: string;
  @IsOptional() @IsEnum(NotificationType) type?: NotificationType;
}
export class SettingsDto {
  @IsString() storeName: string;
  @IsEmail() supportEmail: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() address?: string;
  @IsString() orderPrefix: string;
}
