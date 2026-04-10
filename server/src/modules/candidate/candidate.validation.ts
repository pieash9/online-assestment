import { z } from "zod";

export const examIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({}).optional()
});

export const attemptIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    attemptId: z.string().min(1)
  }),
  query: z.object({}).optional()
});

export const saveAnswerSchema = z.object({
  body: z.object({
    questionId: z.string().min(1),
    textAnswer: z.string().optional(),
    selectedOptionIds: z.array(z.string().min(1)).optional().default([])
  }),
  params: z.object({
    attemptId: z.string().min(1)
  }),
  query: z.object({}).optional()
});

export const behaviorSchema = z.object({
  body: z.object({
    eventType: z.enum(["TAB_SWITCH", "FULLSCREEN_EXIT"])
  }),
  params: z.object({
    attemptId: z.string().min(1)
  }),
  query: z.object({}).optional()
});

export const submitAttemptSchema = z.object({
  body: z.object({
    autoSubmitted: z.boolean().optional().default(false)
  }),
  params: z.object({
    attemptId: z.string().min(1)
  }),
  query: z.object({}).optional()
});
