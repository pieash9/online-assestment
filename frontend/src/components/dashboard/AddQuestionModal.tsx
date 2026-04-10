"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { EmployerExamQuestion, QuestionPayload, QuestionType } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

type OptionDraft = {
  id: string;
  label: string;
  isCorrect: boolean;
};

type AddQuestionModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitQuestion: (payload: QuestionPayload) => Promise<void>;
  isSubmitting?: boolean;
  defaultQuestionType?: QuestionType;
  initialQuestion?: EmployerExamQuestion | null;
};

function htmlToText(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getInitialOptions(): OptionDraft[] {
  return ["A", "B", "C"].map((key, index) => ({
    id: `${key}-${index}-${Date.now()}`,
    label: "",
    isCorrect: false,
  }));
}

function toOptionDrafts(question?: EmployerExamQuestion | null): OptionDraft[] {
  if (!question || question.type === "TEXT") {
    return getInitialOptions();
  }

  if (question.options.length === 0) {
    return getInitialOptions();
  }

  return question.options.map((option, index) => ({
    id: option.id || `opt-${index}-${Date.now()}`,
    label: option.label,
    isCorrect: option.isCorrect,
  }));
}

export default function AddQuestionModal({
  open,
  onOpenChange,
  onSubmitQuestion,
  isSubmitting = false,
  defaultQuestionType = "RADIO",
  initialQuestion = null,
}: AddQuestionModalProps) {
  const [questionBody, setQuestionBody] = useState(initialQuestion?.title ?? "");
  const [questionType, setQuestionType] = useState<QuestionType>(
    initialQuestion?.type ?? defaultQuestionType,
  );
  const [score, setScore] = useState("1");
  const [options, setOptions] = useState<OptionDraft[]>(toOptionDrafts(initialQuestion));
  const [formError, setFormError] = useState("");
  const isEditMode = Boolean(initialQuestion);

  const resetDraft = (nextQuestionType?: QuestionType, question?: EmployerExamQuestion | null) => {
    setQuestionBody(question?.title ?? "");
    setQuestionType(question?.type ?? nextQuestionType ?? defaultQuestionType);
    setScore("1");
    setOptions(toOptionDrafts(question));
    setFormError("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      resetDraft(defaultQuestionType, initialQuestion);
    }

    onOpenChange(nextOpen);
  };

  const optionLetters = useMemo(
    () => options.map((_, index) => String.fromCharCode(65 + index)),
    [options],
  );

  const setOptionLabel = (id: string, value: string) => {
    setOptions((current) =>
      current.map((option) => (option.id === id ? { ...option, label: value } : option)),
    );
  };

  const setOptionCorrect = (id: string, checked: boolean) => {
    setOptions((current) =>
      current.map((option) => (option.id === id ? { ...option, isCorrect: checked } : option)),
    );
  };

  const addMoreOption = () => {
    setOptions((current) => [
      ...current,
      {
        id: `extra-${current.length}-${Date.now()}`,
        label: "",
        isCorrect: false,
      },
    ]);
  };

  const removeOption = (id: string) => {
    setOptions((current) => {
      if (current.length <= 1) {
        return current;
      }

      return current.filter((option) => option.id !== id);
    });
  };

  const toPayload = (): QuestionPayload | null => {
    const normalizedQuestionTitle = htmlToText(questionBody);

    if (!normalizedQuestionTitle) {
      setFormError("Question title is required.");
      return null;
    }

    if (questionType === "TEXT") {
      setFormError("");
      return {
        title: normalizedQuestionTitle,
        type: "TEXT",
        options: [],
      };
    }

    const parsedOptions = options
      .map((option) => ({ label: htmlToText(option.label), isCorrect: option.isCorrect }))
      .filter((option) => option.label.length > 0);

    if (parsedOptions.length === 0) {
      setFormError("Add at least one option for this question.");
      return null;
    }

    setFormError("");
    return {
      title: normalizedQuestionTitle,
      type: questionType,
      options: parsedOptions,
    };
  };

  const handleSave = async (closeAfterSave: boolean) => {
    const payload = toPayload();

    if (!payload) {
      return;
    }

    await onSubmitQuestion(payload);

    if (closeAfterSave) {
      onOpenChange(false);
      return;
    }

    resetDraft(questionType, isEditMode ? initialQuestion : null);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-2xl pb-4 sm:max-w-215">
        <DialogHeader className="border-b border-[#e5e7eb] px-5 py-4 mt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-5 items-center justify-center rounded-full border border-[#cbd5e1] text-[11px] text-[#64748b]">
                1
              </span>
              <DialogTitle className="text-[22px] font-semibold text-[#334155]">
                {isEditMode ? "Edit Question" : "Question 1"}
              </DialogTitle>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#334155]">Score:</span>
              <Input
                className="h-8 w-14 rounded-md border-[#d7dde7] text-center text-xs"
                min={1}
                type="number"
                value={score}
                onChange={(event) => setScore(event.target.value)}
              />
              <select
                className="h-8 rounded-md border border-[#d7dde7] bg-white px-2 text-xs text-[#334155]"
                value={questionType}
                onChange={(event) => setQuestionType(event.target.value as QuestionType)}
              >
                <option value="RADIO">MCQ</option>
                <option value="CHECKBOX">Checkbox</option>
                <option value="TEXT">Text</option>
              </select>
              <Button
                className="h-8 w-8 p-0 text-[#64748b]"
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>

          <DialogDescription className="sr-only">
            {isEditMode
              ? "Edit an existing question and options."
              : "Add a question and options like the design."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4">
          <RichTextEditor
            placeholder="Write your question"
            value={questionBody}
            onChange={setQuestionBody}
          />

          {questionType !== "TEXT" ? (
            <div className="space-y-4 pl-5">
              {options.map((option, index) => (
                <div key={option.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-[#64748b]">
                      <span className="inline-flex size-5 items-center justify-center rounded-full border border-[#cbd5e1] text-[11px]">
                        {optionLetters[index]}
                      </span>
                      <Checkbox
                        checked={option.isCorrect}
                        onCheckedChange={(checked) =>
                          setOptionCorrect(option.id, Boolean(checked))
                        }
                      />
                      <span>Set as correct answer</span>
                    </div>

                    <Button
                      className="h-8 w-8 p-0 text-[#64748b]"
                      type="button"
                      variant="ghost"
                      onClick={() => removeOption(option.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  <RichTextEditor
                    className="rounded-lg"
                    placeholder={`Option ${optionLetters[index]}`}
                    value={option.label}
                    onChange={(value) => setOptionLabel(option.id, value)}
                  />
                </div>
              ))}

              <Button
                className="h-9 px-0 text-xs text-[#6633ff]"
                type="button"
                variant="link"
                onClick={addMoreOption}
              >
                <Plus className="mr-1 size-3.5" />
                Another options
              </Button>
            </div>
          ) : (
            <p className="text-sm text-[#64748b]">
              This question will accept free-form text answers.
            </p>
          )}

          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
        </div>

        <DialogFooter className="border-t border-[#e5e7eb] bg-white px-5 py-2">
          <Button
            className="h-10 w-full rounded-xl border border-[#b9a8ff] bg-white text-[#6633ff] hover:bg-[#f6f3ff] sm:w-auto sm:min-w-28"
            disabled={isSubmitting}
            type="button"
            variant="outline"
            onClick={() => handleSave(true)}
          >
            {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Save"}
          </Button>
          {!isEditMode ? (
            <Button
              className="h-10 w-full rounded-xl bg-[#6633ff] text-white hover:bg-[#5b2ef0] sm:w-auto sm:min-w-36"
              disabled={isSubmitting}
              type="button"
              onClick={() => handleSave(false)}
            >
              {isSubmitting ? "Saving..." : "Save & Add More"}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
