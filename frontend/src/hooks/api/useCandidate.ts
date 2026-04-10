"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import type {
  SaveAnswerInput,
  SubmitAttemptInput,
  TrackBehaviorInput,
} from "@/lib/api/types";
import { candidateService } from "@/services/candidate.service";

export function useCandidateExamsQuery() {
  return useQuery({
    queryKey: queryKeys.candidateExams,
    queryFn: candidateService.getExams,
  });
}

export function useAttemptQuestionsQuery(attemptId: string) {
  return useQuery({
    queryKey: queryKeys.attemptQuestions(attemptId),
    queryFn: () => candidateService.getAttemptQuestions(attemptId),
    enabled: Boolean(attemptId),
  });
}

export function useStartAttemptMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (examId: string) => candidateService.startAttempt(examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidateExams });
    },
  });
}

export function useSaveAnswerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      attemptId,
      payload,
    }: {
      attemptId: string;
      payload: SaveAnswerInput;
    }) => candidateService.saveAnswer(attemptId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.attemptQuestions(variables.attemptId),
      });
    },
  });
}

export function useTrackBehaviorMutation() {
  return useMutation({
    mutationFn: ({
      attemptId,
      payload,
    }: {
      attemptId: string;
      payload: TrackBehaviorInput;
    }) => candidateService.trackBehavior(attemptId, payload),
  });
}

export function useSubmitAttemptMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      attemptId,
      payload,
    }: {
      attemptId: string;
      payload?: SubmitAttemptInput;
    }) => candidateService.submitAttempt(attemptId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.attemptQuestions(variables.attemptId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.candidateExams });
    },
  });
}
