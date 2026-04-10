export const queryKeys = {
  health: ["health"] as const,
  employerExams: ["employer", "exams"] as const,
  employerExam: (examId: string) => ["employer", "exams", examId] as const,
  examCandidates: (examId: string) =>
    ["employer", "exams", examId, "candidates"] as const,
  candidateExams: ["candidate", "exams"] as const,
  attemptQuestions: (attemptId: string) =>
    ["candidate", "attempts", attemptId] as const,
};
