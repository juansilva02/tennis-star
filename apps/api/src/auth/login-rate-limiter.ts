import { HttpException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class LoginRateLimiter {
  private lastCleanup = 0;
  private readonly ipLimit: number;
  private readonly accountLimit: number;

  constructor(private prisma: PrismaService, config: ConfigService) {
    const readLimit = (key: string, fallback: number) => {
      const value = Number(config.get<string>(key) ?? fallback);
      if (!Number.isSafeInteger(value) || value < 1 || value > 10000) {
        throw new Error(`${key} debe ser un entero entre 1 y 10000`);
      }
      return value;
    };
    this.ipLimit = readLimit("AUTH_LOGIN_IP_LIMIT", 30);
    this.accountLimit = readLimit("AUTH_LOGIN_ACCOUNT_LIMIT", 10);
  }

  async check(ip: string, email: string) {
    const now = new Date();
    const expires = new Date(now.getTime() + 15 * 60 * 1000);
    if (now.getTime() - this.lastCleanup > 60_000) {
      await this.prisma.$executeRaw`DELETE FROM "LoginRateLimit" WHERE "expiresAt" < ${now}`;
      await this.prisma.$executeRaw`DELETE FROM "AuthSession" WHERE "expiresAt" < ${now}`;
      this.lastCleanup = now.getTime();
    }
    // Shared atomic counters keep limits effective across API replicas.
    for (const [scope, limit] of [[`ip:${ip}`, this.ipLimit], [`account:${email.toLowerCase()}`, this.accountLimit]] as const) {
      const key = createHash("sha256").update(scope).digest("hex");
      const [bucket] = await this.prisma.$queryRaw<{ count: number }[]>`
        INSERT INTO "LoginRateLimit" ("key", "count", "expiresAt") VALUES (${key}, 1, ${expires})
        ON CONFLICT ("key") DO UPDATE SET
          "count" = CASE WHEN "LoginRateLimit"."expiresAt" <= ${now} THEN 1 ELSE LEAST("LoginRateLimit"."count" + 1, 1000000) END,
          "expiresAt" = CASE WHEN "LoginRateLimit"."expiresAt" <= ${now} THEN ${expires} ELSE "LoginRateLimit"."expiresAt" END
        RETURNING "count"
      `;
      if (bucket.count > limit) throw new HttpException("Demasiados intentos. Esperá 15 minutos para volver a intentar.", 429);
    }
  }
}
