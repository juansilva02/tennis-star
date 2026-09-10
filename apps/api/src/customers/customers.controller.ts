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
import { CustomerDto, LoyaltyDto, MembershipDto, UpdateCustomerDto, UpdateMembershipDto } from "./customers.dto";
import { CustomersService } from "./customers.service";
@ApiTags("Clientes y fidelización")
@Controller()
export class CustomersController {
  constructor(private s: CustomersService) {}
  @Get("customers") list(@Query() q: any) {
    return this.s.list(q);
  }
  @Post("customers") async create(@Body() d: CustomerDto) {
    return { data: await this.s.create(d) };
  }
  @Patch("customers/:id") async update(
    @Param("id") id: string,
    @Body() d: UpdateCustomerDto,
  ) {
    return { data: await this.s.update(id, d) };
  }
  @Delete("customers/:id") async archive(@Param("id") id: string) {
    return { data: await this.s.archive(id) };
  }
  @Post("customers/:id/restore") async restore(@Param("id") id: string) {
    return { data: await this.s.archive(id, true) };
  }
  @Get("loyalty") loyalty(@Query() q: any) {
    return this.s.loyalty(q);
  }
  @Post("customers/:id/loyalty") async points(
    @Param("id") id: string,
    @Body() d: LoyaltyDto,
  ) {
    return { data: await this.s.addPoints(id, d) };
  }
  @Get("memberships") memberships(@Query() q: any) {
    return this.s.memberships(q);
  }
  @Post("memberships") async createM(@Body() d: MembershipDto) {
    return { data: await this.s.createMembership(d) };
  }
  @Patch("memberships/:id") async updateM(
    @Param("id") id: string,
    @Body() d: UpdateMembershipDto,
  ) {
    return { data: await this.s.updateMembership(id, d) };
  }
  @Delete("memberships/:id") async deleteM(@Param("id") id: string) {
    return { data: await this.s.deleteMembership(id) };
  }
}
