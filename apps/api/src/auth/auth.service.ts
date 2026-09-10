import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { verify } from "argon2";
import { PrismaService } from "../prisma/prisma.service";
import { ImageStorageService } from "../uploads/image-storage.service";
import { LoginDto } from "./auth.dto";
import { randomUUID } from "node:crypto";
import { LoginRateLimiter } from "./login-rate-limiter";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private imageStorage: ImageStorageService,
    private rateLimiter: LoginRateLimiter,
  ) {}
  async login(dto: LoginDto, ip: string) {
    await this.rateLimiter.check(ip, dto.email);
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user || !(await verify(user.passwordHash, dto.password)))
      throw new UnauthorizedException("Correo o contraseña incorrectos");
    const expiresIn = dto.rememberMe ? "30d" : "8h";
    const sid = randomUUID();
    const expiresAt = new Date(Date.now() + (dto.rememberMe ? 30 * 24 : 8) * 60 * 60 * 1000);
    const token = await this.jwt.signAsync(
      { sub: user.id, email: user.email, sid },
      { expiresIn },
    );
    await this.prisma.$executeRaw`INSERT INTO "AuthSession" ("id", "userId", "expiresAt") VALUES (${sid}, ${user.id}, ${expiresAt})`;
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
  async logout(token?: string) {
    if (!token) return;
    let payload: { sid?: string; sub?: string };
    try { payload = await this.jwt.verifyAsync(token); } catch { return; }
    if (typeof payload.sid !== "string" || typeof payload.sub !== "string") return;
    await this.prisma.$executeRaw`DELETE FROM "AuthSession" WHERE "id" = ${payload.sid} AND "userId" = ${payload.sub}`;
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
