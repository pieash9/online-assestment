import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { sendError } from "../utils/api-response";
import { HttpError } from "../utils/http-error";

export function notFoundHandler(_req: Request, res: Response) {
  return res.status(404).json(sendError("Route not found"));
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json(sendError(error.message));
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      data: error.flatten()
    });
  }

  console.error(error);
  return res.status(500).json(sendError("Internal server error"));
}
