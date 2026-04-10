import cors from "cors";
import express from "express";
import authRoutes from "./modules/auth/auth.routes";
import employerRoutes from "./modules/employer/employer.routes";
import candidateRoutes from "./modules/candidate/candidate.routes";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

const app = express();

app.use(cors());
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
