import { Router } from "express";
import { UserRole } from "@prisma/client";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  addQuestion,
  createExam,
  deleteQuestion,
  getEmployerExam,
  listEmployerExams,
  listExamCandidates,
  updateExam,
  updateQuestion
} from "./employer.controller";
import {
  createExamSchema,
  createQuestionSchema,
  examIdParamSchema,
  updateExamSchema,
  updateQuestionSchema
} from "./employer.validation";

const router = Router();

router.use(requireAuth, requireRole(UserRole.EMPLOYER));

router.get("/exams", listEmployerExams);
router.post("/exams", validate(createExamSchema), createExam);
router.get("/exams/:id", validate(examIdParamSchema), getEmployerExam);
router.put("/exams/:id", validate(updateExamSchema), updateExam);
router.post("/exams/:id/questions", validate(createQuestionSchema), addQuestion);
router.get("/exams/:id/candidates", validate(examIdParamSchema), listExamCandidates);
router.put("/questions/:id", validate(updateQuestionSchema), updateQuestion);
router.delete("/questions/:id", validate(examIdParamSchema), deleteQuestion);

export default router;
