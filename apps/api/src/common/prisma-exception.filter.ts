import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Response } from "express";

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      exception.code === "P2025"
        ? HttpStatus.NOT_FOUND
        : exception.code === "P2002" || exception.code === "P2003"
          ? HttpStatus.CONFLICT
          : HttpStatus.BAD_REQUEST;
    const message =
      exception.code === "P2002"
        ? "Ya existe un registro con esos datos únicos."
        : exception.code === "P2003"
          ? "El registro está relacionado con otros datos y no puede eliminarse."
          : exception.code === "P2025"
            ? "Registro no encontrado."
            : "No se pudo completar la operación en la base de datos.";
    response.status(status).json({
      statusCode: status,
      message,
      code: exception.code,
      timestamp: new Date().toISOString(),
    });
  }
}
