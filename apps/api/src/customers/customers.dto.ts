import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { PartialType } from "@nestjs/swagger";
export class CustomerDto {
  @IsString() name: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() avatarUrl?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() postalCode?: string;
  @IsOptional() @IsString() membershipId?: string;
}
export class MembershipDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @IsNumber() @Min(0) price: number;
  @IsArray() @IsString({ each: true }) benefits: string[];
  @IsOptional() @IsBoolean() active?: boolean;
}
export class LoyaltyDto {
  @IsInt() points: number;
  @IsString() reason: string;
}
export class UpdateCustomerDto extends PartialType(CustomerDto, { skipNullProperties: false }) {}
export class UpdateMembershipDto extends PartialType(MembershipDto, { skipNullProperties: false }) {}
