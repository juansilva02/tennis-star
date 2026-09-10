import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC_KEY } from "../common/public.decorator";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext) {
    if (
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ])
    )
      return true;
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.tennis_session;
    if (!token) throw new UnauthorizedException("Sesión requerida");
    try {
      request.user = await this.jwt.verifyAsync(token);
    } catch {
      throw new UnauthorizedException("La sesión expiró");
    }
    const { sid, sub } = request.user;
    if (typeof sid !== "string" || typeof sub !== "string") throw new UnauthorizedException("Sesión inválida");
    const sessions = await this.prisma.$queryRaw<{ id: string }[]>`SELECT "id" FROM "AuthSession" WHERE "id" = ${sid} AND "userId" = ${sub} AND "expiresAt" > ${new Date()}`;
    if (!sessions.length) throw new UnauthorizedException("La sesión expiró");
    return true;
  }
}
