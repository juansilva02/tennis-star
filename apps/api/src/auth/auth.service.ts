import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { verify } from "argon2";
import { PrismaService } from "../prisma/prisma.service";
import { ImageStorageService } from "../uploads/image-storage.service";
import { LoginDto } from "./auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private imageStorage: ImageStorageService,
  ) {}
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user || !(await verify(user.passwordHash, dto.password)))
      throw new UnauthorizedException("Correo o contraseña incorrectos");
    const expiresIn = dto.rememberMe ? "30d" : "8h";
    const token = await this.jwt.signAsync(
      { sub: user.id, email: user.email },
      { expiresIn },
    );
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      persistent: !!dto.rememberMe,
    };
  }
  async me(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, avatarUrl: true },
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }
  async updateAvatar(id: string, file: Express.Multer.File) {
    const current = await this.prisma.user.findUnique({
      where: { id },
      select: { avatarUrl: true },
    });
    if (!current) throw new UnauthorizedException();

    const avatarUrl = await this.imageStorage.storeWebp(file.buffer, `avatar-${id}`);
    try {
      const updated = await this.prisma.user.update({
        where: { id },
        data: { avatarUrl },
        select: { id: true, name: true, email: true, avatarUrl: true },
      });
      await this.imageStorage.remove(current.avatarUrl);
      return updated;
    } catch (error) {
      await this.imageStorage.remove(avatarUrl);
      throw error;
    }
  }
  async removeAvatar(id: string) {
    const current = await this.prisma.user.findUnique({
      where: { id },
      select: { avatarUrl: true },
    });
    if (!current) throw new UnauthorizedException();
    const updated = await this.prisma.user.update({
      where: { id },
      data: { avatarUrl: null },
      select: { id: true, name: true, email: true, avatarUrl: true },
    });
    await this.imageStorage.remove(current.avatarUrl);
    return updated;
  }
}
