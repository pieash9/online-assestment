"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { useAddQuestionMutation } from "@/hooks/api/useEmployer";
import type { EmployerExamQuestion, QuestionPayload, QuestionType } from "@/lib/api/types";
import { getApiErrorMessage } from "@/lib/api/client";
import AddQuestionModal from "@/components/dashboard/AddQuestionModal";
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
  const addQuestionMutation = useAddQuestionMutation();

  const handleAddQuestion = async (payload: QuestionPayload) => {
    await addQuestionMutation.mutateAsync({ examId, payload });
  };

  return (
    <div className="mx-auto w-full max-w-238.5 space-y-4">
      {questions.length === 0 ? (
        <Card className="rounded-2xl border border-[#e5e7eb] py-0 shadow-[0_2.714px_4.397px_rgba(192,192,192,0.03),0_6.863px_11.119px_rgba(192,192,192,0.04),0_13.999px_22.683px_rgba(192,192,192,0.05),0_28.836px_46.722px_rgba(192,192,192,0.06),0_79px_128px_rgba(192,192,192,0.09)]">
          <CardContent className="flex flex-col items-center gap-4 px-6 py-8 text-center">
            <Button
              className="h-11 rounded-xl bg-[#6633ff] px-8 text-white hover:bg-[#5b2ef0] w-full"
              disabled={!examId}
              type="button"
              onClick={() => setIsModalOpen(true)}
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
                <button className="text-[#6633ff]" type="button">
                  Edit
                </button>
                <button className="text-[#ef4444]" type="button">
                  Remove From Exam
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
              onClick={() => setIsModalOpen(true)}
            >
              Add Question
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {addQuestionMutation.isError ? (
        <p className="text-center text-sm text-red-600">
          {getApiErrorMessage(addQuestionMutation.error)}
        </p>
      ) : null}

      <AddQuestionModal
        defaultQuestionType={defaultQuestionType}
        isSubmitting={addQuestionMutation.isPending}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmitQuestion={handleAddQuestion}
      />
    </div>
  );
}
