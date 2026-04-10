import { NextFunction, Request, Response } from "express";
import { ZodError, ZodType } from "zod";

export function validate(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query
      });

      return next();
    } catch (error) {
      return next(error as ZodError);
    }
  };
}
