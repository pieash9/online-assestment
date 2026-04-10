import { apiClient, unwrapResponse } from "@/lib/api/client";
import type {
  CreateExamInput,
  EmployerExamDetails,
  EmployerExamQuestion,
  EmployerExamSummary,
  ExamCandidateAssignment,
  QuestionPayload,
} from "@/lib/api/types";

export const employerService = {
  getExams: () =>
    unwrapResponse<EmployerExamSummary[]>(apiClient.get("/employer/exams")),

  createExam: (payload: CreateExamInput) =>
    unwrapResponse<EmployerExamDetails>(apiClient.post("/employer/exams", payload)),

  updateExam: (examId: string, payload: CreateExamInput) =>
    unwrapResponse<EmployerExamDetails>(apiClient.put(`/employer/exams/${examId}`, payload)),

  getExam: (examId: string) =>
    unwrapResponse<EmployerExamDetails>(apiClient.get(`/employer/exams/${examId}`)),

  addQuestion: (examId: string, payload: QuestionPayload) =>
    unwrapResponse<EmployerExamQuestion>(
      apiClient.post(`/employer/exams/${examId}/questions`, payload),
    ),

  getExamCandidates: (examId: string) =>
    unwrapResponse<ExamCandidateAssignment[]>(
      apiClient.get(`/employer/exams/${examId}/candidates`),
    ),

  updateQuestion: (questionId: string, payload: QuestionPayload) =>
    unwrapResponse<EmployerExamQuestion>(
      apiClient.put(`/employer/questions/${questionId}`, payload),
    ),

  deleteQuestion: (questionId: string) =>
    unwrapResponse<null>(apiClient.delete(`/employer/questions/${questionId}`)),
};
