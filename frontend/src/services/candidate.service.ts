import { apiClient, unwrapResponse } from "@/lib/api/client";
import type {
  AttemptQuestionsResponse,
  CandidateExamSummary,
  ExamAttemptRecord,
  SaveAnswerInput,
  SavedAnswerResponse,
  SubmitAttemptInput,
  TrackBehaviorInput,
} from "@/lib/api/types";

export const candidateService = {
  getExams: () =>
    unwrapResponse<CandidateExamSummary[]>(apiClient.get("/candidate/exams")),

  startAttempt: (examId: string) =>
    unwrapResponse<ExamAttemptRecord>(apiClient.post(`/candidate/exams/${examId}/start`)),

  getAttemptQuestions: (attemptId: string) =>
    unwrapResponse<AttemptQuestionsResponse>(
      apiClient.get(`/candidate/attempts/${attemptId}`),
    ),

  saveAnswer: (attemptId: string, payload: SaveAnswerInput) =>
    unwrapResponse<SavedAnswerResponse>(
      apiClient.post(`/candidate/attempts/${attemptId}/answer`, payload),
    ),

  trackBehavior: (attemptId: string, payload: TrackBehaviorInput) =>
    unwrapResponse<ExamAttemptRecord>(
      apiClient.post(`/candidate/attempts/${attemptId}/behavior`, payload),
    ),

  submitAttempt: (attemptId: string, payload: SubmitAttemptInput = {}) =>
    unwrapResponse<ExamAttemptRecord>(
      apiClient.post(`/candidate/attempts/${attemptId}/submit`, payload),
    ),
};
