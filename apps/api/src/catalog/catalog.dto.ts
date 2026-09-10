import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from "class-validator";
import { Gender, ProductStatus } from "@prisma/client";
import { PartialType } from "@nestjs/swagger";

export class CatalogDto {
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() active?: boolean;
}
export class OptionDto {
  @IsString() name: string;
  @IsArray() @IsString({ each: true }) values: string[];
}
export class ProductDto {
  @IsString() sku: string;
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @Type(() => Number) @IsNumber() @Min(0) price: number;
  @IsEnum(Gender) gender: Gender;
  @Type(() => Number) @IsInt() @Min(0) stock: number;
  @IsEnum(ProductStatus) status: ProductStatus;
  @IsOptional() @IsUrl() imageUrl?: string;
  @IsString() categoryId: string;
  @IsString() brandId: string;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options?: OptionDto[];
}

export class ProductImageUploadDto {
  @IsString() @IsNotEmpty() productId: string;
  @IsOptional() @IsString() altText?: string;
  @IsOptional()
  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  isPrimary?: boolean = true;
}

export class UpdateCatalogDto extends PartialType(CatalogDto, { skipNullProperties: false }) {}
export class UpdateProductDto extends PartialType(ProductDto, { skipNullProperties: false }) {}
