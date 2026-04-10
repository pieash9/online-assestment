import { Router } from "express";
import { UserRole } from "@prisma/client";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  getAttemptQuestions,
  listCandidateExams,
  saveAnswer,
  startExamAttempt,
  submitAttempt,
  trackBehavior
} from "./candidate.controller";
import {
  attemptIdParamSchema,
  behaviorSchema,
  examIdParamSchema,
  saveAnswerSchema,
  submitAttemptSchema
} from "./candidate.validation";

const router = Router();

router.use(requireAuth, requireRole(UserRole.CANDIDATE));

router.get("/exams", listCandidateExams);
router.post("/exams/:id/start", validate(examIdParamSchema), startExamAttempt);
router.get("/attempts/:attemptId", validate(attemptIdParamSchema), getAttemptQuestions);
router.post("/attempts/:attemptId/answer", validate(saveAnswerSchema), saveAnswer);
router.post("/attempts/:attemptId/behavior", validate(behaviorSchema), trackBehavior);
router.post("/attempts/:attemptId/submit", validate(submitAttemptSchema), submitAttempt);

export default router;
