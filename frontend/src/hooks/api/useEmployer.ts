"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import type { CreateExamInput, QuestionPayload } from "@/lib/api/types";
import { employerService } from "@/services/employer.service";

export function useEmployerExamsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.employerExams,
    queryFn: employerService.getExams,
    enabled,
  });
}

export function useEmployerExamQuery(examId: string) {
  return useQuery({
    queryKey: queryKeys.employerExam(examId),
    queryFn: () => employerService.getExam(examId),
    enabled: Boolean(examId),
  });
}

export function useExamCandidatesQuery(examId: string) {
  return useQuery({
    queryKey: queryKeys.examCandidates(examId),
    queryFn: () => employerService.getExamCandidates(examId),
    enabled: Boolean(examId),
  });
}

export function useCreateExamMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateExamInput) => employerService.createExam(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employerExams });
    },
  });
}

export function useAddQuestionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ examId, payload }: { examId: string; payload: QuestionPayload }) =>
      employerService.addQuestion(examId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.employerExam(variables.examId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.employerExams });
    },
  });
}

export function useUpdateQuestionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      examId,
      questionId,
      payload,
    }: {
      examId: string;
      questionId: string;
      payload: QuestionPayload;
    }) => employerService.updateQuestion(questionId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.employerExam(variables.examId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.employerExams });
    },
  });
}

export function useDeleteQuestionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ examId, questionId }: { examId: string; questionId: string }) =>
      employerService.deleteQuestion(questionId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.employerExam(variables.examId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.employerExams });
    },
  });
}
