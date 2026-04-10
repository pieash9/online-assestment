import { z } from "zod";

const questionOptionSchema = z.object({
  label: z.string().min(1),
  isCorrect: z.boolean().optional().default(false)
});

export const createExamSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    totalCandidates: z.number().int().positive(),
    totalSlots: z.number().int().positive(),
    questionSets: z.number().int().positive(),
    questionType: z.string().min(1),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    durationMinutes: z.number().int().positive(),
    negativeMarking: z.number().min(0).default(0)
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const examIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({}).optional()
});

export const createQuestionSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    type: z.enum(["CHECKBOX", "RADIO", "TEXT"]),
    options: z.array(questionOptionSchema).optional().default([])
  }),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({}).optional()
});

export const updateQuestionSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    type: z.enum(["CHECKBOX", "RADIO", "TEXT"]),
    options: z.array(questionOptionSchema).optional().default([])
  }),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({}).optional()
});
