import { AssignmentStatus, AttemptStatus, QuestionType } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { sendSuccess } from "../../utils/api-response";
import { HttpError } from "../../utils/http-error";

async function getCandidateAssignment(examId: string, candidateId: string) {
  const assignment = await prisma.examAssignment.findUnique({
    where: {
      examId_candidateId: {
        examId,
        candidateId
      }
    },
    include: {
      exam: {
        include: {
          _count: {
            select: {
              questions: true
            }
          }
        }
      }
    }
  });

  if (!assignment) {
    throw new HttpError(404, "Assigned exam not found");
  }

  return assignment;
}

async function getOwnedAttempt(attemptId: string, candidateId: string) {
  const attempt = await prisma.examAttempt.findFirst({
    where: {
      id: attemptId,
      candidateId
    },
    include: {
      exam: {
        include: {
          questions: {
            include: {
              options: true
            }
          }
        }
      },
      answers: {
        include: {
          selectedOptions: true
        }
      }
    }
  });

  if (!attempt) {
    throw new HttpError(404, "Attempt not found");
  }

  return attempt;
}

export async function listCandidateExams(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const candidateId = req.user!.userId;

    const assignments = await prisma.examAssignment.findMany({
      where: { candidateId },
      include: {
        exam: {
          include: {
            _count: {
              select: {
                questions: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const payload = assignments.map((assignment: (typeof assignments)[number]) => ({
      id: assignment.exam.id,
      title: assignment.exam.title,
      durationMinutes: assignment.exam.durationMinutes,
      questions: assignment.exam._count.questions,
      negativeMarking: Number(assignment.exam.negativeMarking),
      status: assignment.status.toLowerCase(),
      startTime: assignment.exam.startTime,
      endTime: assignment.exam.endTime
    }));

    return res.json(sendSuccess(payload, "Candidate exams fetched successfully"));
  } catch (error) {
    return next(error);
  }
}

export async function startExamAttempt(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const candidateId = req.user!.userId;
    const examId = String(req.params.id);

    const assignment = await getCandidateAssignment(examId, candidateId);
    const now = new Date();

    if (now < assignment.exam.startTime || now > assignment.exam.endTime) {
      throw new HttpError(400, "Exam is not active right now");
    }

    const attempt = await prisma.examAttempt.upsert({
      where: {
        examId_candidateId: {
          examId,
          candidateId
        }
      },
      update: {},
      create: {
        examId,
        candidateId,
        status: AttemptStatus.STARTED
      }
    });

    await prisma.examAssignment.update({
      where: {
        examId_candidateId: {
          examId,
          candidateId
        }
      },
      data: {
        status: AssignmentStatus.STARTED
      }
    });

    return res.status(201).json(sendSuccess(attempt, "Exam attempt started"));
  } catch (error) {
    return next(error);
  }
}

export async function getAttemptQuestions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const candidateId = req.user!.userId;
    const attemptId = String(req.params.attemptId);

    const attempt = await getOwnedAttempt(attemptId, candidateId);

    const answersByQuestionId = new Map(
      attempt.answers.map((answer: (typeof attempt.answers)[number]) => [
        answer.questionId,
        {
          textAnswer: answer.textAnswer,
          selectedOptionIds: answer.selectedOptions.map(
            (item: (typeof answer.selectedOptions)[number]) => item.optionId
          )
        }
      ])
    );

    const payload = {
      id: attempt.id,
      status: attempt.status.toLowerCase(),
      autoSubmitted: attempt.autoSubmitted,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      exam: {
        id: attempt.exam.id,
        title: attempt.exam.title,
        durationMinutes: attempt.exam.durationMinutes,
        questions: attempt.exam.questions.map((question: (typeof attempt.exam.questions)[number]) => ({
          id: question.id,
          title: question.title,
          type: question.type,
          options:
            question.type === QuestionType.TEXT
              ? []
              : question.options.map((option: (typeof question.options)[number]) => ({
                  id: option.id,
                  label: option.label
                })),
          answer: answersByQuestionId.get(question.id) ?? null
        }))
      }
    };

    return res.json(sendSuccess(payload, "Attempt questions fetched successfully"));
  } catch (error) {
    return next(error);
  }
}

export async function saveAnswer(req: Request, res: Response, next: NextFunction) {
  try {
    const candidateId = req.user!.userId;
    const attemptId = String(req.params.attemptId);
    const { questionId, textAnswer, selectedOptionIds } = req.body;

    const attempt = await getOwnedAttempt(attemptId, candidateId);

    if (attempt.status !== AttemptStatus.STARTED) {
      throw new HttpError(400, "This attempt is already submitted");
    }

    const question = attempt.exam.questions.find(
      (item: (typeof attempt.exam.questions)[number]) => item.id === questionId
    );

    if (!question) {
      throw new HttpError(404, "Question not found in this exam");
    }

    if (question.type === QuestionType.TEXT && !textAnswer?.trim()) {
      throw new HttpError(400, "Text answer is required for text questions");
    }

    if (question.type !== QuestionType.TEXT && selectedOptionIds.length === 0) {
      throw new HttpError(400, "At least one option must be selected");
    }

    const allowedOptionIds = new Set(
      question.options.map((option: (typeof question.options)[number]) => option.id)
    );

    for (const optionId of selectedOptionIds) {
      if (!allowedOptionIds.has(optionId)) {
        throw new HttpError(400, "One or more selected options are invalid");
      }
    }

    const answer = await prisma.answer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId
        }
      },
      update: {
        textAnswer: question.type === QuestionType.TEXT ? textAnswer?.trim() ?? "" : null
      },
      create: {
        attemptId,
        questionId,
        textAnswer: question.type === QuestionType.TEXT ? textAnswer?.trim() ?? "" : null
      }
    });

    await prisma.answerOption.deleteMany({
      where: {
        answerId: answer.id
      }
    });

    if (question.type !== QuestionType.TEXT && selectedOptionIds.length > 0) {
      await prisma.answerOption.createMany({
        data: selectedOptionIds.map((optionId: string) => ({
          answerId: answer.id,
          optionId
        }))
      });
    }

    return res.json(sendSuccess(answer, "Answer saved successfully"));
  } catch (error) {
    return next(error);
  }
}

export async function trackBehavior(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const candidateId = req.user!.userId;
    const attemptId = String(req.params.attemptId);
    const { eventType } = req.body;

    await getOwnedAttempt(attemptId, candidateId);

    const updateData =
      eventType === "TAB_SWITCH"
        ? { tabSwitchCount: { increment: 1 } }
        : { fullscreenExitCount: { increment: 1 } };

    const attempt = await prisma.examAttempt.update({
      where: { id: attemptId },
      data: updateData
    });

    return res.json(sendSuccess(attempt, "Behavior event recorded successfully"));
  } catch (error) {
    return next(error);
  }
}

export async function submitAttempt(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const candidateId = req.user!.userId;
    const attemptId = String(req.params.attemptId);
    const autoSubmitted = req.body.autoSubmitted ?? false;

    const attempt = await getOwnedAttempt(attemptId, candidateId);

    if (attempt.status !== AttemptStatus.STARTED) {
      throw new HttpError(400, "This attempt has already been submitted");
    }

    const updatedAttempt = await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        status: autoSubmitted ? AttemptStatus.TIMEOUT : AttemptStatus.SUBMITTED,
        submittedAt: new Date(),
        autoSubmitted
      }
    });

    await prisma.examAssignment.update({
      where: {
        examId_candidateId: {
          examId: attempt.examId,
          candidateId
        }
      },
      data: {
        status: autoSubmitted ? AssignmentStatus.TIMEOUT : AssignmentStatus.SUBMITTED
      }
    });

    return res.json(
      sendSuccess(
        updatedAttempt,
        autoSubmitted ? "Attempt auto-submitted successfully" : "Attempt submitted successfully"
      )
    );
  } catch (error) {
    return next(error);
  }
}
