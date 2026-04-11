"use client";

import { CheckCheck, CircleX, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useAttemptQuestionsQuery,
  useSaveAnswerMutation,
  useStartAttemptMutation,
  useSubmitAttemptMutation,
} from "@/hooks/api/useCandidate";
import { useAppSelector } from "@/hooks/useRedux";
import { getApiErrorMessage } from "@/lib/api/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AttemptQuestionPanel from "./components/AttemptQuestionPanel";
import AttemptResultDialog from "./components/AttemptResultDialog";
import Image from "next/image";

function formatTime(secondsLeft: number) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

type DraftAnswer = {
  textAnswer: string;
  selectedOptionIds: string[];
};

function hasRichTextContent(value: string) {
  const plainText = value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  return plainText.length > 0;
}

export default function AttendTestPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const examId = typeof params.id === "string" ? params.id : "";

  const user = useAppSelector((state) => state.auth.user);
  const isCandidate = user?.role === "CANDIDATE";

  const [attemptId, setAttemptId] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [draftByQuestionId, setDraftByQuestionId] = useState<
    Record<string, DraftAnswer>
  >({});
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [manualResultModal, setManualResultModal] = useState<
    "completed" | "timeout" | null
  >(null);

  const startedRef = useRef(false);
  const timeoutSubmittedRef = useRef(false);

  const startAttemptMutation = useStartAttemptMutation();
  const saveAnswerMutation = useSaveAnswerMutation();
  const submitAttemptMutation = useSubmitAttemptMutation();

  const attemptQuery = useAttemptQuestionsQuery(attemptId);

  useEffect(() => {
    if (!isCandidate || !examId || startedRef.current) {
      return;
    }

    startedRef.current = true;

    void startAttemptMutation
      .mutateAsync(examId)
      .then((attempt) => {
        setAttemptId(attempt.id);
      })
      .catch(() => {
        startedRef.current = false;
      });
  }, [examId, isCandidate, startAttemptMutation]);

  useEffect(() => {
    if (!attemptQuery.data || manualResultModal) {
      return;
    }

    const timerId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [attemptQuery.data, manualResultModal]);

  const secondsLeft = useMemo(() => {
    if (!attemptQuery.data) {
      return null;
    }

    const attemptStatus = attemptQuery.data.status.toUpperCase();
    if (attemptStatus !== "STARTED") {
      return 0;
    }

    return Math.max(
      0,
      Math.floor(
        (new Date(attemptQuery.data.startedAt).getTime() +
          attemptQuery.data.exam.durationMinutes * 60 * 1000 -
          nowMs) /
          1000,
      ),
    );
  }, [attemptQuery.data, nowMs]);

  const status = attemptQuery.data?.status.toUpperCase();
  const isCompletedModalOpen =
    manualResultModal === "completed" || status === "SUBMITTED";
  const isTimeoutModalOpen =
    manualResultModal === "timeout" || status === "TIMEOUT";

  useEffect(() => {
    if (
      secondsLeft !== 0 ||
      !attemptId ||
      timeoutSubmittedRef.current ||
      submitAttemptMutation.isPending
    ) {
      return;
    }

    timeoutSubmittedRef.current = true;

    void submitAttemptMutation
      .mutateAsync({
        attemptId,
        payload: { autoSubmitted: true },
      })
      .then(() => {
        setManualResultModal("timeout");
      })
      .catch((error) => {
        console.error("Failed to submit attempt on timeout:", error);
      });
  }, [attemptId, secondsLeft, submitAttemptMutation]);

  const questions = attemptQuery.data?.exam.questions ?? [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const currentDraft = useMemo<DraftAnswer | null>(() => {
    if (!currentQuestion) {
      return null;
    }

    return (
      draftByQuestionId[currentQuestion.id] ?? {
        textAnswer: currentQuestion.answer?.textAnswer ?? "",
        selectedOptionIds: currentQuestion.answer?.selectedOptionIds ?? [],
      }
    );
  }, [currentQuestion, draftByQuestionId]);

  const canSubmitAnswer = useMemo(() => {
    if (!currentQuestion || !currentDraft) {
      return false;
    }

    if (currentQuestion.type === "TEXT") {
      return hasRichTextContent(currentDraft.textAnswer);
    }

    if (currentQuestion.type === "CHECKBOX") {
      return currentDraft.selectedOptionIds.length > 0;
    }

    return currentDraft.selectedOptionIds.length > 0;
  }, [currentDraft, currentQuestion]);

  const disabledActions =
    !currentQuestion ||
    saveAnswerMutation.isPending ||
    submitAttemptMutation.isPending ||
    isCompletedModalOpen ||
    isTimeoutModalOpen;

  const submitCurrentAnswer = async () => {
    if (
      !currentQuestion ||
      !currentDraft ||
      !attemptId ||
      disabledActions ||
      !canSubmitAnswer
    ) {
      return;
    }

    await saveAnswerMutation.mutateAsync({
      attemptId,
      payload: {
        questionId: currentQuestion.id,
        textAnswer:
          currentQuestion.type === "TEXT" ? currentDraft.textAnswer : undefined,
        selectedOptionIds:
          currentQuestion.type === "TEXT" ? [] : currentDraft.selectedOptionIds,
      },
    });

    if (isLastQuestion) {
      await submitAttemptMutation.mutateAsync({
        attemptId,
        payload: { autoSubmitted: false },
      });
      setManualResultModal("completed");
      return;
    }

    setCurrentQuestionIndex((index) => index + 1);
  };

  const handleRadioChange = (value: string) => {
    if (!currentQuestion) {
      return;
    }

    setDraftByQuestionId((previous) => ({
      ...previous,
      [currentQuestion.id]: {
        textAnswer: "",
        selectedOptionIds: value ? [value] : [],
      },
    }));
  };

  const handleCheckboxChange = (optionId: string, checked: boolean) => {
    if (!currentQuestion) {
      return;
    }

    setDraftByQuestionId((previous) => {
      const existing =
        previous[currentQuestion.id]?.selectedOptionIds ??
        currentQuestion.answer?.selectedOptionIds ??
        [];
      const updated = checked
        ? existing.includes(optionId)
          ? existing
          : [...existing, optionId]
        : existing.filter((id) => id !== optionId);

      return {
        ...previous,
        [currentQuestion.id]: {
          textAnswer: "",
          selectedOptionIds: updated,
        },
      };
    });
  };

  const handleTextChange = (value: string) => {
    if (!currentQuestion) {
      return;
    }

    setDraftByQuestionId((previous) => ({
      ...previous,
      [currentQuestion.id]: {
        textAnswer: value,
        selectedOptionIds: [],
      },
    }));
  };

  const skipCurrentQuestion = () => {
    if (!currentQuestion || isLastQuestion || disabledActions) {
      return;
    }

    setCurrentQuestionIndex((index) => index + 1);
  };

  if (!isCandidate) {
    return (
      <section className="min-h-[calc(100vh-10rem)] bg-[#f9fafb] px-4 py-14 sm:px-6 lg:px-10">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 rounded-2xl border border-[#e5e7eb] bg-white px-6 py-10 text-center">
          <h1 className="text-2xl font-semibold text-[#334155]">
            Candidate Access Only
          </h1>
          <p className="text-sm text-[#64748b]">
            This page is only available for candidate accounts.
          </p>
          <Button
            className="h-11 rounded-xl bg-[#6633ff] px-6 text-white hover:bg-[#5b2ef0]"
            onClick={() => router.push("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-10rem)] bg-[#f3f4f6] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-245 flex-col gap-4">
        <Card className="rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 shadow-none sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-lg font-semibold text-[#334155]">
              Question (
              {Math.min(currentQuestionIndex + 1, Math.max(1, totalQuestions))}/
              {Math.max(totalQuestions, 1)})
            </p>
            <div className="rounded-xl bg-[#f3f4f6] px-6 py-2 text-lg font-semibold text-[#334155]">
              {secondsLeft === null
                ? "--:-- left"
                : `${formatTime(secondsLeft)} left`}
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-[#e5e7eb] bg-white px-4 py-6 shadow-none sm:px-6">
          {startAttemptMutation.isPending ||
          (attemptId && attemptQuery.isLoading) ? (
            <div className="flex items-center justify-center gap-2 py-20 text-[#64748b]">
              <Loader2 className="size-4 animate-spin" />
              Loading exam question...
            </div>
          ) : startAttemptMutation.isError ? (
            <p className="py-16 text-center text-sm text-red-600">
              {getApiErrorMessage(startAttemptMutation.error)}
            </p>
          ) : attemptQuery.isError ? (
            <p className="py-16 text-center text-sm text-red-600">
              {getApiErrorMessage(attemptQuery.error)}
            </p>
          ) : !currentQuestion ? (
            <p className="py-16 text-center text-sm text-[#64748b]">
              No questions are available for this attempt.
            </p>
          ) : (
            <AttemptQuestionPanel
              canSubmitAnswer={canSubmitAnswer}
              currentDraft={currentDraft}
              currentQuestion={currentQuestion}
              currentQuestionIndex={currentQuestionIndex}
              disabledActions={disabledActions}
              isLastQuestion={isLastQuestion}
              isSaving={
                saveAnswerMutation.isPending || submitAttemptMutation.isPending
              }
              onCheckboxChange={handleCheckboxChange}
              onRadioChange={handleRadioChange}
              onSkip={skipCurrentQuestion}
              onSubmit={() => {
                void submitCurrentAnswer();
              }}
              onTextChange={handleTextChange}
            />
          )}
        </Card>
      </div>

      <AttemptResultDialog
        description={`Congratulations! ${user?.name}, You have completed your MCQ Exam for Probationary Officer. Thank you for participating.`}
        icon={
          <Image
            className="size-16"
            src="/images/icons/okay.png"
            alt="Check"
            height={80}
            width={80}
          />
        }
        iconWrapperClassName="bg-[#e8f3ff] text-[#2684ff]"
        open={isCompletedModalOpen}
        title="Test Completed"
      />

      <AttemptResultDialog
        description={`Dear ${user?.name}, Your exam time has been finished. Thank you for participating.`}
        icon={
          <Image
            className="size-16"
            src="/images/icons/timeout.png"
            alt="Circle X"
            height={80}
            width={80}
          />
        }
        iconWrapperClassName="text-[#ef4444]"
        open={isTimeoutModalOpen}
        title="Timeout!"
      />
    </section>
  );
}
