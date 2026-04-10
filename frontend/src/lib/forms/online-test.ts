import { z } from "zod";

export const questionTypeOptions = ["RADIO", "CHECKBOX", "TEXT"] as const;

export const onlineTestSchema = z
  .object({
    title: z.string().min(1, "Online test title is required."),
    totalCandidates: z.coerce
      .number()
      .int()
      .positive("Enter a valid candidate count."),
    totalSlots: z.coerce.number().int().positive("Enter a valid slot count."),
    questionSets: z.coerce
      .number()
      .int()
      .positive("Enter a valid question set count."),
    questionType: z.enum(questionTypeOptions, {
      message: "Select a question type.",
    }),
    startTime: z.string().min(1, "Start date and time is required."),
    endTime: z.string().min(1, "End date and time is required."),
    durationMinutes: z.coerce
      .number()
      .int()
      .positive("Enter duration in minutes."),
    negativeMarking: z.coerce
      .number()
      .min(0, "Negative marking cannot be negative."),
  })
  .refine((values) => new Date(values.endTime) > new Date(values.startTime), {
    message: "End time must be after the start time.",
    path: ["endTime"],
  });

export type OnlineTestFormValues = z.infer<typeof onlineTestSchema>;
export type OnlineTestFormInput = z.input<typeof onlineTestSchema>;

export const onlineTestDefaultValues: OnlineTestFormValues = {
  title: "",
  totalCandidates: 10000,
  totalSlots: 3,
  questionSets: 3,
  questionType: "RADIO",
  startTime: "",
  endTime: "",
  durationMinutes: 30,
  negativeMarking: 0,
};

export const questionTypeLabelMap: Record<OnlineTestFormValues["questionType"], string> = {
  RADIO: "MCQ",
  CHECKBOX: "Checkbox",
  TEXT: "Text",
};

export function toDatetimeLocalValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function toLocalInputValue(dateString: string) {
  const parsedDate = new Date(dateString);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return toDatetimeLocalValue(parsedDate);
}
