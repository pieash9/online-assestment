"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import {
  useAddQuestionMutation,
  useDeleteQuestionMutation,
  useUpdateQuestionMutation,
} from "@/hooks/api/useEmployer";
import type { EmployerExamQuestion, QuestionPayload, QuestionType } from "@/lib/api/types";
import { getApiErrorMessage } from "@/lib/api/client";
import AddQuestionModal from "@/components/dashboard/AddQuestionModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type QuestionSetStepProps = {
  examId: string;
  questions: EmployerExamQuestion[];
  defaultQuestionType?: QuestionType;
};

export default function QuestionSetStep({
  examId,
  questions,
  defaultQuestionType = "RADIO",
}: QuestionSetStepProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<EmployerExamQuestion | null>(null);
  const [confirmingDeleteQuestionId, setConfirmingDeleteQuestionId] = useState<string | null>(
    null,
  );
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);

  const addQuestionMutation = useAddQuestionMutation();
  const updateQuestionMutation = useUpdateQuestionMutation();
  const deleteQuestionMutation = useDeleteQuestionMutation();

  const handleSubmitQuestion = async (payload: QuestionPayload) => {
    if (editingQuestion) {
      await updateQuestionMutation.mutateAsync({
        examId,
        questionId: editingQuestion.id,
        payload,
      });
      return;
    }

    await addQuestionMutation.mutateAsync({ examId, payload });
  };

  const handleOpenAddQuestion = () => {
    setEditingQuestion(null);
    setIsModalOpen(true);
  };

  const handleOpenEditQuestion = (question: EmployerExamQuestion) => {
    setEditingQuestion(question);
    setIsModalOpen(true);
  };

  const handleRemoveQuestion = async (questionId: string) => {
    setDeletingQuestionId(questionId);

    try {
      await deleteQuestionMutation.mutateAsync({ examId, questionId });
      setConfirmingDeleteQuestionId(null);
    } finally {
      setDeletingQuestionId(null);
    }
  };

  const handleModalOpenChange = (nextOpen: boolean) => {
    setIsModalOpen(nextOpen);

    if (!nextOpen) {
      setEditingQuestion(null);
    }
  };

  const isSubmittingQuestion = addQuestionMutation.isPending || updateQuestionMutation.isPending;
  const activeError =
    addQuestionMutation.error ?? updateQuestionMutation.error ?? deleteQuestionMutation.error;
  const modalRenderKey = `${isModalOpen ? "open" : "closed"}-${editingQuestion?.id ?? "new"}`;

  return (
    <div className="mx-auto w-full max-w-238.5 space-y-4">
      {questions.length === 0 ? (
        <Card className="rounded-2xl border border-[#e5e7eb] py-0 shadow-[0_2.714px_4.397px_rgba(192,192,192,0.03),0_6.863px_11.119px_rgba(192,192,192,0.04),0_13.999px_22.683px_rgba(192,192,192,0.05),0_28.836px_46.722px_rgba(192,192,192,0.06),0_79px_128px_rgba(192,192,192,0.09)]">
          <CardContent className="flex flex-col items-center gap-4 px-6 py-8 text-center">
            <Button
              className="h-11 rounded-xl bg-[#6633ff] px-8 text-white hover:bg-[#5b2ef0] w-full"
              disabled={!examId}
              type="button"
              onClick={handleOpenAddQuestion}
            >
              Add Question
            </Button>
          </CardContent>
        </Card>
      ) : (
        questions.map((question, index) => (
          <Card
            key={question.id}
            className="rounded-2xl border border-[#e5e7eb] py-0 shadow-[0_2.714px_4.397px_rgba(192,192,192,0.03),0_6.863px_11.119px_rgba(192,192,192,0.04),0_13.999px_22.683px_rgba(192,192,192,0.05),0_28.836px_46.722px_rgba(192,192,192,0.06),0_79px_128px_rgba(192,192,192,0.09)]"
          >
            <CardContent className="space-y-4 px-6 py-5 sm:px-8">
              <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-3">
                <h3 className="text-sm font-semibold text-[#334155]">Question {index + 1}</h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full border border-[#d7dde7] px-2 py-0.5 text-[#64748b]">
                    {question.type === "RADIO"
                      ? "MCQ"
                      : question.type === "CHECKBOX"
                        ? "Checkbox"
                        : "Text"}
                  </span>
                  <span className="rounded-full border border-[#d7dde7] px-2 py-0.5 text-[#64748b]">
                    1 pt
                  </span>
                </div>
              </div>

              <p className="text-sm font-semibold text-[#1f2937]">{question.title}</p>

              {question.type === "TEXT" ? (
                <p className="text-sm leading-6 text-[#475569]">
                  This text question does not have options. Candidates will provide a free-form
                  answer.
                </p>
              ) : (
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={option.id}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                        option.isCorrect ? "bg-[#f3f4f6]" : "bg-transparent"
                      }`}
                    >
                      <span className="text-[#334155]">
                        {String.fromCharCode(65 + optionIndex)}. {option.label}
                      </span>
                      {option.isCorrect ? (
                        <span className="inline-flex size-4 items-center justify-center rounded-full bg-[#22c55e] text-white">
                          <Check className="size-3" />
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-[#e5e7eb] pt-3 text-sm">
                <button
                  className="text-[#6633ff] disabled:text-[#94a3b8] cursor-pointer"
                  disabled={isSubmittingQuestion || deleteQuestionMutation.isPending}
                  type="button"
                  onClick={() => handleOpenEditQuestion(question)}
                >
                  Edit
                </button>
                <button
                  className="text-[#ef4444] disabled:text-[#fca5a5] cursor-pointer"
                  disabled={deleteQuestionMutation.isPending}
                  type="button"
                  onClick={() => setConfirmingDeleteQuestionId(question.id)}
                >
                  {deleteQuestionMutation.isPending && deletingQuestionId === question.id
                    ? "Removing..."
                    : "Remove From Exam"}
                </button>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {questions.length > 0 ? (
        <Card className="rounded-2xl border border-[#e5e7eb] py-0 shadow-[0_2.714px_4.397px_rgba(192,192,192,0.03),0_6.863px_11.119px_rgba(192,192,192,0.04),0_13.999px_22.683px_rgba(192,192,192,0.05),0_28.836px_46.722px_rgba(192,192,192,0.06),0_79px_128px_rgba(192,192,192,0.09)]">
          <CardContent className="px-6 py-4 sm:px-8">
            <Button
              className="h-11 w-full rounded-xl bg-[#6633ff] text-white hover:bg-[#5b2ef0]"
              disabled={!examId}
              type="button"
              onClick={handleOpenAddQuestion}
            >
              Add Question
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {activeError ? <p className="text-center text-sm text-red-600">{getApiErrorMessage(activeError)}</p> : null}

      <AddQuestionModal
        key={modalRenderKey}
        defaultQuestionType={defaultQuestionType}
        initialQuestion={editingQuestion}
        isSubmitting={isSubmittingQuestion}
        open={isModalOpen}
        onOpenChange={handleModalOpenChange}
        onSubmitQuestion={handleSubmitQuestion}
      />

      <AlertDialog
        open={Boolean(confirmingDeleteQuestionId)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setConfirmingDeleteQuestionId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this question?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The question will be removed from this exam.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteQuestionMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#ef4444] text-white hover:bg-[#dc2626]"
              disabled={deleteQuestionMutation.isPending || !confirmingDeleteQuestionId}
              onClick={(event) => {
                event.preventDefault();

                if (!confirmingDeleteQuestionId) {
                  return;
                }

                void handleRemoveQuestion(confirmingDeleteQuestionId);
              }}
            >
              {deleteQuestionMutation.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
