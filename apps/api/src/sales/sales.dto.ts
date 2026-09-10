import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  Max,
  ArrayMaxSize,
  ArrayMinSize,
  ValidateNested,
} from "class-validator";
import { PaymentMethod, PaymentStatus, SaleStatus } from "@prisma/client";
class SaleItemDto {
  @IsString() productId: string;
  @Type(() => Number) @IsInt() @Min(1) @Max(1000000) quantity: number;
}
export class SaleOptionsQueryDto {
  @IsOptional() @IsString() @MaxLength(120) search?: string;
  @IsOptional() @IsString() @MaxLength(64) cursor?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) limit = 20;
}
export class CreateSaleDto {
  @IsString() customerId: string;
  @IsEnum(PaymentMethod) paymentMethod: PaymentMethod;
  @IsOptional() @IsEnum(PaymentStatus) paymentStatus?: PaymentStatus;
  @IsString() shippingAddress: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() @MaxLength(64) discountCode?: string;
  @IsArray()
  @ArrayMinSize(1) @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];
}
export class PreviewSaleDiscountDto {
  @IsString() @IsNotEmpty() @MaxLength(64) discountCode: string;
  @IsArray()
  @ArrayMinSize(1) @ArrayMaxSize(100)
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
