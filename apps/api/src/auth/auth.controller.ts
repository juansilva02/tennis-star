import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags } from "@nestjs/swagger";
import { Request, Response } from "express";
import { Public } from "../common/public.decorator";
import { AuthService } from "./auth.service";
import { ForgotPasswordDto, LoginDto } from "./auth.dto";

@ApiTags("Autenticación")
@Controller("auth")
export class AuthController {
  constructor(private auth: AuthService) {}
  @Public()
  @Post("login")
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.login(dto);
    res.cookie("tennis_session", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      ...(result.persistent ? { maxAge: 30 * 24 * 60 * 60 * 1000 } : {}),
    });
    return { data: result.user };
  }
  @Get("me") async me(@Req() req: Request & { user: { sub: string } }) {
    return { data: await this.auth.me(req.user.sub) };
  }
  @Post("avatar")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (_request, file, callback) =>
        callback(
          null,
          ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype),
        ),
    }),
  )
  async avatar(
    @Req() req: Request & { user: { sub: string } },
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        "Seleccione una imagen JPG, PNG o WebP de hasta 2 MB",
      );
    }
    return { data: await this.auth.updateAvatar(req.user.sub, file) };
  }
  @Delete("avatar")
  async removeAvatar(@Req() req: Request & { user: { sub: string } }) {
    return { data: await this.auth.removeAvatar(req.user.sub) };
  }
  @Post("logout") @HttpCode(204) logout(
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie("tennis_session", { path: "/" });
  }
  @Public() @Post("forgot-password") @HttpCode(202) forgot(
    @Body() _dto: ForgotPasswordDto,
  ) {
    return {
      message:
        "Si el correo existe, recibirá instrucciones para recuperar el acceso.",
    };
  }
}
