import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags } from "@nestjs/swagger";
import { CatalogService } from "./catalog.service";
import { CatalogDto, ProductDto, ProductImageUploadDto } from "./catalog.dto";

@ApiTags("Catálogo")
@Controller()
export class CatalogController {
  constructor(private service: CatalogService) {}
  @Get("categories") categories(@Query() q: any) {
    return this.service.listCatalog("category", q);
  }
  @Post("categories") async createCategory(@Body() d: CatalogDto) {
    return { data: await this.service.createCatalog("category", d) };
  }
  @Patch("categories/:id") async updateCategory(
    @Param("id") id: string,
    @Body() d: Partial<CatalogDto>,
  ) {
    return { data: await this.service.updateCatalog("category", id, d) };
  }
  @Delete("categories/:id") async deleteCategory(@Param("id") id: string) {
    return { data: await this.service.deleteCatalog("category", id) };
  }
  @Get("brands") brands(@Query() q: any) {
    return this.service.listCatalog("brand", q);
  }
  @Post("brands") async createBrand(@Body() d: CatalogDto) {
    return { data: await this.service.createCatalog("brand", d) };
  }
  @Patch("brands/:id") async updateBrand(
    @Param("id") id: string,
    @Body() d: Partial<CatalogDto>,
  ) {
    return { data: await this.service.updateCatalog("brand", id, d) };
  }
  @Delete("brands/:id") async deleteBrand(@Param("id") id: string) {
    return { data: await this.service.deleteCatalog("brand", id) };
  }
  @Get("products") products(@Query() q: any) {
    return this.service.products(q);
  }
  @Post("products") async createProduct(@Body() d: ProductDto) {
    return { data: await this.service.createProduct(d) };
  }
  @Patch("products/:id") async updateProduct(
    @Param("id") id: string,
    @Body() d: Partial<ProductDto>,
  ) {
    return { data: await this.service.updateProduct(id, d) };
  }
  @Delete("products/:id") async archive(@Param("id") id: string) {
    return { data: await this.service.archiveProduct(id) };
  }
  @Post("products/:id/restore") async restore(@Param("id") id: string) {
    return { data: await this.service.archiveProduct(id, true) };
  }
  @Post("products/import") async import(@Body() rows: ProductDto[]) {
    return { data: await this.service.importProducts(rows) };
  }
  @Post("uploads/products")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_r, f, cb) =>
        cb(
          null,
          ["image/jpeg", "image/png", "image/webp"].includes(f.mimetype),
        ),
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ProductImageUploadDto,
  ) {
    if (!file)
      throw new BadRequestException(
        "Seleccione una imagen JPG, PNG o WebP de hasta 5 MB",
      );
    return { data: await this.service.storeProductImage(dto, file.buffer) };
  }
}
