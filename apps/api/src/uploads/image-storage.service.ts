import { randomBytes } from "node:crypto";
import { mkdir, rename, rm } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { BadRequestException, Injectable } from "@nestjs/common";
const sharp: typeof import("sharp").default = require("sharp");

const UPLOAD_PREFIX = "/uploads/";

export function resolveUploadDirectory() {
  return resolve(process.env.UPLOAD_DIR ?? resolve(process.cwd(), "uploads"));
}

function safePrefix(value: string) {
  return (
    value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60) || "imagen"
  );
}

@Injectable()
export class ImageStorageService {
  readonly directory = resolveUploadDirectory();

  async storeWebp(buffer: Buffer, prefix: string) {
    await mkdir(this.directory, { recursive: true });
    const filename = `${safePrefix(prefix)}-${randomBytes(5).toString("hex")}.webp`;
    const finalPath = resolve(this.directory, filename);
    const temporaryPath = `${finalPath}.tmp`;

    try {
      await sharp(buffer)
        .rotate()
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(temporaryPath);
      await rename(temporaryPath, finalPath);
      return `${UPLOAD_PREFIX}${filename}`;
    } catch {
      await rm(temporaryPath, { force: true });
      throw new BadRequestException("El archivo no contiene una imagen válida");
    }
  }

  async remove(url?: string | null) {
    if (!url?.startsWith(UPLOAD_PREFIX)) return;
    const filename = basename(url);
    if (url !== `${UPLOAD_PREFIX}${filename}`) return;
    await rm(resolve(this.directory, filename), { force: true });
  }
}
