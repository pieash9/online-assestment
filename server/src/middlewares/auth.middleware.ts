import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { env } from "../config/env";
import { sendError } from "../utils/api-response";

type JwtPayload = {
  userId: string;
  role: UserRole;
};

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json(sendError("Unauthorized"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = payload;
    return next();
  } catch {
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
