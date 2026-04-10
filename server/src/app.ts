import cors from "cors";
import express from "express";
import { env } from "./config/env";
import authRoutes from "./modules/auth/auth.routes";
import employerRoutes from "./modules/employer/employer.routes";
import candidateRoutes from "./modules/candidate/candidate.routes";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

const app = express();

app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  return res.json({
    success: true,
    message: "API is healthy",
    data: null
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/employer", employerRoutes);
app.use("/api/candidate", candidateRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
