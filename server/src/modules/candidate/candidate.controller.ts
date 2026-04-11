import { AttemptStatus, QuestionType } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { sendSuccess } from "../../utils/api-response";
import { HttpError } from "../../utils/http-error";

async function getExamById(examId: string) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: {
      id: true,
      startTime: true,
      endTime: true
    }
  });

  if (!exam) {
    throw new HttpError(404, "Exam not found");
  }

  return exam;
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

    const exams = await prisma.exam.findMany({
      include: {
        _count: {
          select: {
            questions: true
          }
        },
        attempts: {
          where: {
            candidateId
          },
          select: {
            status: true
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const payload = exams.map((exam: (typeof exams)[number]) => ({
      id: exam.id,
      title: exam.title,
      durationMinutes: exam.durationMinutes,
      questions: exam._count.questions,
      negativeMarking: Number(exam.negativeMarking),
      status: (exam.attempts[0]?.status ?? "ASSIGNED").toLowerCase(),
      startTime: exam.startTime,
      endTime: exam.endTime
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

    await getExamById(examId);

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
