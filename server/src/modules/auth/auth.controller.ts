import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { sendSuccess } from "../../utils/api-response";
import { HttpError } from "../../utils/http-error";

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new HttpError(401, "Invalid Credentials!");
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      throw new HttpError(401, "Invalid Credentials!");
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role
      },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json(
      sendSuccess(
        {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        },
        "Login successful"
      )
    );
  } catch (error) {
    return next(error);
  }
}
