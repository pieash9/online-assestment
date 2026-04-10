import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { env } from "../config/env";
import { sendError } from "../utils/api-response";
import {
  clearAuthCookie,
  getAuthTokenFromRequest,
} from "../modules/auth/auth.cookies";

type JwtPayload = {
  userId: string;
  role: UserRole;
};

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = getAuthTokenFromRequest(req);

  if (!token) {
    return res.status(401).json(sendError("Unauthorized"));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = payload;
    return next();
  } catch {
    clearAuthCookie(res);
    return res.status(401).json(sendError("Invalid or expired token"));
  }
}

export function requireRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(sendError("Unauthorized"));
    }

    if (req.user.role !== role) {
      return res.status(403).json(sendError("Forbidden"));
    }

    return next();
  };
}
