export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  data: null;
};

export type UserRole = "ADMIN" | "EMPLOYER" | "CANDIDATE";

export type QuestionType = "CHECKBOX" | "RADIO" | "TEXT";

export type BehaviorEventType = "TAB_SWITCH" | "FULLSCREEN_EXIT";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type HealthResponse = null;

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: AuthUser;
};

export type CurrentUserResponse = {
  user: AuthUser;
};

export type EmployerExamSummary = {
  id: string;
  examName: string;
  candidates: number;
  questionSets: number;
  questionCount: number;
  examSlots: number;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  negativeMarking: number;
};

export type QuestionOptionInput = {
  label: string;
  isCorrect?: boolean;
};

export type CreateExamInput = {
  title: string;
  totalCandidates: number;
  totalSlots: number;
  questionSets: number;
  questionType: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  negativeMarking?: number;
};

export type EmployerExamQuestionOption = {
  id: string;
  label: string;
  isCorrect: boolean;
  questionId: string;
};

export type EmployerExamQuestion = {
  id: string;
  title: string;
  type: QuestionType;
  examId: string;
  options: EmployerExamQuestionOption[];
};

export type EmployerExamAssignment = {
  id: string;
  candidateId: string;
  examId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  candidate: AuthUser;
};

export type EmployerExamDetails = {
  id: string;
  title: string;
  totalCandidates: number;
  totalSlots: number;
  questionSets: number;
  questionType: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  negativeMarking: number;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  questions: EmployerExamQuestion[];
  assignments: EmployerExamAssignment[];
  _count: {
    questions: number;
    assignments: number;
  };
};

export type QuestionPayload = {
  title: string;
  type: QuestionType;
  options?: QuestionOptionInput[];
};

export type ExamCandidateAssignment = {
  id: string;
  status: string;
  candidate: Pick<AuthUser, "id" | "name" | "email">;
};

export type CandidateExamSummary = {
  id: string;
  title: string;
  durationMinutes: number;
  questions: number;
  negativeMarking: number;
  status: string;
  startTime: string;
  endTime: string;
};

export type ExamAttemptRecord = {
  id: string;
  examId: string;
  candidateId: string;
  status: string;
  autoSubmitted: boolean;
  startedAt: string;
  submittedAt: string | null;
  tabSwitchCount: number;
  fullscreenExitCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AttemptAnswer = {
  textAnswer?: string;
  selectedOptionIds: string[];
};

export type AttemptQuestionOption = {
  id: string;
  label: string;
};

export type AttemptQuestion = {
  id: string;
  title: string;
  type: QuestionType;
  options: AttemptQuestionOption[];
  answer: AttemptAnswer | null;
};

export type AttemptQuestionsResponse = {
  id: string;
  status: string;
  autoSubmitted: boolean;
  startedAt: string;
  submittedAt: string | null;
  exam: {
    id: string;
    title: string;
    durationMinutes: number;
    questions: AttemptQuestion[];
  };
};

export type SaveAnswerInput = {
  questionId: string;
  textAnswer?: string;
  selectedOptionIds?: string[];
};

export type SavedAnswerResponse = {
  id: string;
  attemptId: string;
  questionId: string;
  textAnswer: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TrackBehaviorInput = {
  eventType: BehaviorEventType;
};

export type SubmitAttemptInput = {
  autoSubmitted?: boolean;
};
