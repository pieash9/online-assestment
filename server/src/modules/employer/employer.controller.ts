import { NextFunction, Request, Response } from "express";
import { QuestionType, UserRole } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { sendSuccess } from "../../utils/api-response";
import { HttpError } from "../../utils/http-error";

async function ensureEmployerOwnsExam(examId: string, employerId: string) {
  const exam = await prisma.exam.findFirst({
    where: {
      id: examId,
      createdById: employerId
    }
  });

  if (!exam) {
    throw new HttpError(404, "Exam not found");
  }

  return exam;
}

export async function listEmployerExams(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const employerId = req.user!.userId;

    const exams = await prisma.exam.findMany({
      where: { createdById: employerId },
      include: {
        _count: {
          select: {
            assignments: true,
            questions: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const payload = exams.map((exam: (typeof exams)[number]) => ({
      id: exam.id,
      examName: exam.title,
      candidates: exam._count.assignments,
      questionSets: exam.questionSets,
      questionCount: exam._count.questions,
      examSlots: exam.totalSlots,
      durationMinutes: exam.durationMinutes,
      startTime: exam.startTime,
      endTime: exam.endTime,
      negativeMarking: Number(exam.negativeMarking)
    }));

    return res.json(sendSuccess(payload, "Employer exams fetched successfully"));
  } catch (error) {
    return next(error);
  }
}

export async function createExam(req: Request, res: Response, next: NextFunction) {
  try {
    const employerId = req.user!.userId;
    const {
      title,
      totalCandidates,
      totalSlots,
      questionSets,
      questionType,
      startTime,
      endTime,
      durationMinutes,
      negativeMarking
    } = req.body;

    const employer = await prisma.user.findFirst({
      where: {
        id: employerId,
        role: UserRole.EMPLOYER
      }
    });

    if (!employer) {
      throw new HttpError(403, "Employer account not found");
    }

    const exam = await prisma.exam.create({
      data: {
        title,
        totalCandidates,
        totalSlots,
        questionSets,
        questionType,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        durationMinutes,
        negativeMarking,
        createdById: employerId
      }
    });

    return res.status(201).json(sendSuccess(exam, "Exam created successfully"));
  } catch (error) {
    return next(error);
  }
}

export async function getEmployerExam(req: Request, res: Response, next: NextFunction) {
  try {
    const employerId = req.user!.userId;
    const examId = String(req.params.id);

    await ensureEmployerOwnsExam(examId, employerId);

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          include: {
            options: true
          }
        },
        assignments: {
          include: {
            candidate: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            questions: true,
            assignments: true
          }
        }
      }
    });

    return res.json(sendSuccess(exam, "Exam details fetched successfully"));
  } catch (error) {
    return next(error);
  }
}

export async function addQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const employerId = req.user!.userId;
    const examId = String(req.params.id);
    const { title, type, options } = req.body;

    await ensureEmployerOwnsExam(examId, employerId);

    if (type !== QuestionType.TEXT && options.length === 0) {
      throw new HttpError(400, "Options are required for checkbox and radio questions");
    }

    const question = await prisma.question.create({
      data: {
        examId,
        title,
        type,
        options: {
          create:
            type === QuestionType.TEXT
              ? []
              : options.map((option: { label: string; isCorrect?: boolean }) => ({
                  label: option.label,
                  isCorrect: option.isCorrect ?? false
                }))
        }
      },
      include: {
        options: true
      }
    });

    return res.status(201).json(sendSuccess(question, "Question added successfully"));
  } catch (error) {
    return next(error);
  }
}

export async function updateQuestion(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const employerId = req.user!.userId;
    const questionId = String(req.params.id);
    const { title, type, options } = req.body;

    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        exam: true
      }
    });

    if (!existingQuestion || existingQuestion.exam.createdById !== employerId) {
      throw new HttpError(404, "Question not found");
    }

    if (type !== QuestionType.TEXT && options.length === 0) {
      throw new HttpError(400, "Options are required for checkbox and radio questions");
    }

    await prisma.questionOption.deleteMany({
      where: { questionId }
    });

    const question = await prisma.question.update({
      where: { id: questionId },
      data: {
        title,
        type,
        options: {
          create:
            type === QuestionType.TEXT
              ? []
              : options.map((option: { label: string; isCorrect?: boolean }) => ({
                  label: option.label,
                  isCorrect: option.isCorrect ?? false
                }))
        }
      },
      include: {
        options: true
      }
    });

    return res.json(sendSuccess(question, "Question updated successfully"));
  } catch (error) {
    return next(error);
  }
}

export async function deleteQuestion(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const employerId = req.user!.userId;
    const questionId = String(req.params.id);

    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        exam: true
      }
    });

    if (!existingQuestion || existingQuestion.exam.createdById !== employerId) {
      throw new HttpError(404, "Question not found");
    }

    await prisma.question.delete({
      where: { id: questionId }
    });

    return res.json(sendSuccess(null, "Question deleted successfully"));
  } catch (error) {
    return next(error);
  }
}

export async function listExamCandidates(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const employerId = req.user!.userId;
    const examId = String(req.params.id);

    await ensureEmployerOwnsExam(examId, employerId);

    const assignments = await prisma.examAssignment.findMany({
      where: { examId },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const payload = assignments.map((assignment: (typeof assignments)[number]) => ({
      id: assignment.id,
      status: assignment.status.toLowerCase(),
      candidate: assignment.candidate
    }));

    return res.json(sendSuccess(payload, "Exam candidates fetched successfully"));
  } catch (error) {
    return next(error);
  }
}
