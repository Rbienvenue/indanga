import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import type { Request } from "express";
import { env } from "src/lib/env";

function normalizeIp(ip: string): string {
  return ip.startsWith("::ffff:") ? ip.slice(7) : ip;
}

@Injectable()
export class CallbackGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // x-forwarded-for is set by reverse proxies (Vercel, nginx, etc.)
    const forwarded = request.headers["x-forwarded-for"];
    const forwardedIp = typeof forwarded === "string" ? forwarded.split(",")[0].trim() : undefined;
    const rawIp = forwardedIp ?? request.ip ?? request.socket.remoteAddress ?? "";
    const clientIp = normalizeIp(rawIp);

    if (clientIp !== env.ITEC_SERVER_ADDRESS) {
      throw new ForbiddenException("Callback not allowed");
    }
    return true;
  }
}
