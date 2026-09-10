import { JwtService } from "@nestjs/jwt";
import type { ExecutionContext } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { LoginRateLimiter } from "./login-rate-limiter";

describe("Seguridad de sesiones", () => {
  const jwt = new JwtService({ secret: "test-secret-with-at-least-32-characters" });
  it("rechaza reutilizar un token después del logout", async () => {
    let exists = true;
    const prisma = {
      $queryRaw: jest.fn(async () => exists ? [{ id: "session-1" }] : []),
      $executeRaw: jest.fn(async () => { exists = false; return 1; }),
    };
    const token = await jwt.signAsync({ sub: "user-1", sid: "session-1" }, { expiresIn: "1h" });
    const req = { cookies: { tennis_session: token } };
    const context = { getHandler: () => {}, getClass: () => {}, switchToHttp: () => ({ getRequest: () => req }) } as unknown as ExecutionContext;
    const guard = new JwtAuthGuard({ getAllAndOverride: () => false } as never, jwt, prisma as never);
    expect(await guard.canActivate(context)).toBe(true);
    await new AuthService(prisma as never, jwt, {} as never, {} as never).logout(token);
    await expect(guard.canActivate(context)).rejects.toThrow("La sesión expiró");
  });
  it("no confunde indisponibilidad de PostgreSQL con credenciales inválidas", async () => {
    const token = await jwt.signAsync({ sub: "user-1", sid: "session-1" });
    const req = { cookies: { tennis_session: token } };
    const context = { getHandler: () => {}, getClass: () => {}, switchToHttp: () => ({ getRequest: () => req }) } as unknown as ExecutionContext;
    const guard = new JwtAuthGuard({ getAllAndOverride: () => false } as never, jwt, { $queryRaw: () => Promise.reject(new Error("Database unavailable")) } as never);
    await expect(guard.canActivate(context)).rejects.toThrow("Database unavailable");
  });
  it("bloquea antes de verificar contraseñas cuando se agota la cuota de IP", async () => {
    const prisma = { $executeRaw: jest.fn(), $queryRaw: jest.fn().mockResolvedValue([{ count: 31 }]) };
    const limiter = new LoginRateLimiter(prisma as never, { get: () => undefined } as never);
    const user = { findUnique: jest.fn() };
    const service = new AuthService({ user } as never, jwt, {} as never, limiter);
    await expect(service.login({ email: "admin@example.invalid", password: "invalid" }, "127.0.0.1")).rejects.toMatchObject({ status: 429 });
    expect(user.findUnique).not.toHaveBeenCalled();
  });
  it("limita también la cuenta aunque cambie la IP", async () => {
    const prisma = {
      $executeRaw: jest.fn(),
      $queryRaw: jest.fn().mockResolvedValueOnce([{ count: 1 }]).mockResolvedValueOnce([{ count: 11 }]),
    };
    const limiter = new LoginRateLimiter(prisma as never, { get: () => undefined } as never);
    await expect(limiter.check("192.0.2.10", "admin@example.invalid")).rejects.toMatchObject({ status: 429 });
  });
  it("rechaza una configuración que deje el límite sin efecto", () => {
    expect(() => new LoginRateLimiter({} as never, { get: () => "NaN" } as never)).toThrow("debe ser un entero");
  });
});
