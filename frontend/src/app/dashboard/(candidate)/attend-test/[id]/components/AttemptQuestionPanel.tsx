"use client";

import type { AttemptQuestion } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

type DraftAnswer = {
  textAnswer: string;
  selectedOptionIds: string[];
};

type AttemptQuestionPanelProps = {
  currentQuestion: AttemptQuestion;
  currentQuestionIndex: number;
  currentDraft: DraftAnswer | null;
  isLastQuestion: boolean;
  disabledActions: boolean;
  canSubmitAnswer: boolean;
  isSaving: boolean;
  onRadioChange: (value: string) => void;
  onCheckboxChange: (optionId: string, checked: boolean) => void;
  onTextChange: (value: string) => void;
  onSkip: () => void;
  onSubmit: () => void;
};

export default function AttemptQuestionPanel({
  currentQuestion,
  currentQuestionIndex,
  currentDraft,
  isLastQuestion,
  disabledActions,
  canSubmitAnswer,
  isSaving,
  onRadioChange,
  onCheckboxChange,
  onTextChange,
  onSkip,
  onSubmit,
}: AttemptQuestionPanelProps) {
  return (
    <>
      <div className="mb-5 flex items-start gap-2 text-xl font-semibold leading-[1.4] text-[#334155]">
        <span className="shrink-0">Q{currentQuestionIndex + 1}.</span>
        <div
          className="[&_p]:m-0 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: currentQuestion.title }}
        />
      </div>

      {currentQuestion.type === "RADIO" ? (
        <RadioGroup
          className="gap-3"
          onValueChange={onRadioChange}
          value={currentDraft?.selectedOptionIds[0] ?? ""}
        >
          {currentQuestion.options.map((option) => (
            <label
              key={option.id}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#e5e7eb] px-4 py-3"
            >
              <RadioGroupItem
                className="border-[#cbd5e1] data-checked:border-[#6633ff] data-checked:bg-[#6633ff]"
                value={option.id}
              />
              <div
                className="text-sm text-[#334155] [&_p]:m-0 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: option.label }}
              />
            </label>
          ))}
        </RadioGroup>
      ) : currentQuestion.type === "CHECKBOX" ? (
        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const checked = currentDraft?.selectedOptionIds.includes(option.id);

            return (
              <label
                key={option.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#e5e7eb] px-4 py-3"
              >
                <Checkbox
                  checked={checked}
                  className="border-[#cbd5e1] data-checked:border-[#6633ff] data-checked:bg-[#6633ff]"
                  onCheckedChange={(value) => {
                    onCheckboxChange(option.id, value === true);
                  }}
                />
                <div
                  className="text-sm text-[#334155] [&_p]:m-0 [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: option.label }}
                />
              </label>
            );
          })}
        </div>
      ) : (
        <RichTextEditor
          className="rounded-lg border-[#e5e7eb]"
          onChange={onTextChange}
          placeholder="Write your answer"
          value={currentDraft?.textAnswer ?? ""}
        />
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button
          className="h-11 rounded-xl border border-[#e5e7eb] bg-white px-6 text-[#334155] hover:bg-[#f8fafc]"
          disabled={disabledActions || isLastQuestion}
          onClick={onSkip}
          variant="outline"
        >
          Skip this Question
        </Button>

        <Button
          className="h-11 rounded-xl bg-[#6633ff] px-8 text-white hover:bg-[#5b2ef0]"
          disabled={disabledActions || !canSubmitAnswer}
          onClick={onSubmit}
        >
          {isSaving ? "Saving..." : isLastQuestion ? "Submit Test" : "Save & Continue"}
        </Button>
      </div>
    </>
  );
}
