import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { PaymentMethod, PaymentStatus, SaleStatus } from "@prisma/client";
class SaleItemDto {
  @IsString() productId: string;
  @Type(() => Number) @IsInt() @Min(1) quantity: number;
}
export class CreateSaleDto {
  @IsString() customerId: string;
  @IsEnum(PaymentMethod) paymentMethod: PaymentMethod;
  @IsOptional() @IsEnum(PaymentStatus) paymentStatus?: PaymentStatus;
  @IsString() shippingAddress: string;
  @IsOptional() @IsString() notes?: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];
}
export class UpdateSaleDto {
  @IsOptional() @IsEnum(SaleStatus) status?: SaleStatus;
  @IsOptional() @IsEnum(PaymentStatus) paymentStatus?: PaymentStatus;
  @IsOptional() @IsEnum(PaymentMethod) paymentMethod?: PaymentMethod;
  @IsOptional() @IsString() shippingAddress?: string;
  @IsOptional() @IsString() trackingId?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() statusNote?: string;
}
