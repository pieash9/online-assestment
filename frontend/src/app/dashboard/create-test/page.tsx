"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateExamMutation } from "@/hooks/api/useEmployer";
import { useAppSelector } from "@/hooks/useRedux";
import { getApiErrorMessage } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const questionTypeOptions = ["RADIO", "CHECKBOX", "TEXT"] as const;

const createExamSchema = z
  .object({
    title: z.string().min(1, "Online test title is required."),
    totalCandidates: z.coerce.number().int().positive("Enter a valid candidate count."),
    totalSlots: z.coerce.number().int().positive("Enter a valid slot count."),
    questionSets: z.coerce.number().int().positive("Enter a valid question set count."),
    questionType: z.enum(questionTypeOptions, {
      message: "Select a question type.",
    }),
    startTime: z.string().min(1, "Start date and time is required."),
    endTime: z.string().min(1, "End date and time is required."),
    durationMinutes: z.coerce.number().int().positive("Enter duration in minutes."),
    negativeMarking: z.coerce.number().min(0, "Negative marking cannot be negative."),
  })
  .refine((values) => new Date(values.endTime) > new Date(values.startTime), {
    message: "End time must be after the start time.",
    path: ["endTime"],
  });

type CreateExamFormValues = z.infer<typeof createExamSchema>;
type CreateExamFormInput = z.input<typeof createExamSchema>;

const defaultValues: CreateExamFormValues = {
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

function toDatetimeLocalValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function CreateTestPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const createExamMutation = useCreateExamMutation();
  const [step, setStep] = useState<1 | 2>(1);
  const [successMessage, setSuccessMessage] = useState("");

  const {
    control,
    handleSubmit,
    register,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateExamFormInput, unknown, CreateExamFormValues>({
    resolver: zodResolver(createExamSchema),
    defaultValues,
  });

  const values = watch();
  const formatNumericValue = (value: unknown, suffix?: string) => {
    if (typeof value !== "number") {
      return "Not set";
    }

    return suffix ? `${value} ${suffix}` : String(value);
  };
  const errorMessage = createExamMutation.error
    ? getApiErrorMessage(createExamMutation.error)
    : "";

  const reviewItems = useMemo<Array<{ label: string; value: string }>>(
    () => [
      { label: "Online Test Title", value: values.title || "Not set" },
      {
        label: "Total Candidates",
        value:
          typeof values.totalCandidates === "number"
            ? values.totalCandidates.toLocaleString()
            : "Not set",
      },
      { label: "Total Slots", value: formatNumericValue(values.totalSlots) },
      { label: "Question Sets", value: formatNumericValue(values.questionSets) },
      { label: "Question Type", value: values.questionType || "Not set" },
      {
        label: "Start Time",
        value: values.startTime ? new Date(values.startTime).toLocaleString() : "Not set",
      },
      {
        label: "End Time",
        value: values.endTime ? new Date(values.endTime).toLocaleString() : "Not set",
      },
      {
        label: "Duration Per Slot",
        value: formatNumericValue(values.durationMinutes, "Minutes"),
      },
      {
        label: "Negative Marking",
        value: formatNumericValue(values.negativeMarking),
      },
    ],
    [values],
  );

  const handleNext = async () => {
    const isValid = await trigger();

    if (isValid) {
      setStep(2);
    }
  };

  const onSubmit = async (formValues: CreateExamFormValues) => {
    setSuccessMessage("");

    try {
      await createExamMutation.mutateAsync({
        ...formValues,
        startTime: new Date(formValues.startTime).toISOString(),
        endTime: new Date(formValues.endTime).toISOString(),
      });

      setSuccessMessage("Online test created successfully. Redirecting...");

      startTransition(() => {
        router.push("/dashboard");
        router.refresh();
      });
    } catch {
      setSuccessMessage("");
    }
  };

  if (user?.role !== "EMPLOYER") {
    return (
      <section className="min-h-[calc(100vh-10rem)] bg-[#f9fafb] px-4 py-14 sm:px-6 lg:px-10">
        <div className="mx-auto flex w-full max-w-[954px] flex-col gap-6 rounded-2xl border border-[#e5e7eb] bg-white p-8 text-center shadow-[0_2.714px_4.397px_rgba(192,192,192,0.03),0_6.863px_11.119px_rgba(192,192,192,0.04),0_13.999px_22.683px_rgba(192,192,192,0.05),0_28.836px_46.722px_rgba(192,192,192,0.06),0_79px_128px_rgba(192,192,192,0.09)]">
          <h1 className="text-[28px] font-semibold leading-[1.3] text-[#334155]">
            Employer Access Only
          </h1>
          <p className="text-base leading-7 text-[#64748b]">
            Only employer accounts can create online tests from this screen.
          </p>
          <div className="flex justify-center">
            <Button asChild className="h-12 rounded-xl bg-[#6633ff] px-8 text-white hover:bg-[#5b2ef0]">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-10rem)] bg-[#f9fafb] px-4 py-14 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8">
        <div className="rounded-2xl bg-white px-6 py-6 shadow-[0_2.714px_4.397px_rgba(192,192,192,0.03),0_6.863px_11.119px_rgba(192,192,192,0.04),0_13.999px_22.683px_rgba(192,192,192,0.05),0_28.836px_46.722px_rgba(192,192,192,0.06),0_79px_128px_rgba(192,192,192,0.09)] sm:px-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h1 className="text-[24px] font-semibold leading-[1.3] text-[#334155]">
                Manage Online Test
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-full bg-[#6633ff] text-sm font-semibold text-white">
                    1
                  </div>
                  <span className="font-medium text-[#334155]">Basic Info</span>
                </div>
                <div className="h-px w-20 bg-[#cbd5e1]" />
                <div className="flex items-center gap-2">
                  <div
                    className={`flex size-6 items-center justify-center rounded-full text-sm font-semibold ${
                      step === 2
                        ? "bg-[#6633ff] text-white"
                        : "bg-[#f1f5f9] text-[#64748b]"
                    }`}
                  >
                    2
                  </div>
                  <span
                    className={`font-medium ${
                      step === 2 ? "text-[#334155]" : "text-[#64748b]"
                    }`}
                  >
                    Review
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button asChild className="h-10 rounded-xl border border-[#6633ff] bg-white px-6 text-[#6633ff] hover:bg-[#f7f3ff]" variant="outline">
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>

        <Card className="mx-auto w-full max-w-[954px] rounded-2xl border border-[#e5e7eb] py-0 shadow-[0_2.714px_4.397px_rgba(192,192,192,0.03),0_6.863px_11.119px_rgba(192,192,192,0.04),0_13.999px_22.683px_rgba(192,192,192,0.05),0_28.836px_46.722px_rgba(192,192,192,0.06),0_79px_128px_rgba(192,192,192,0.09)]">
          <CardHeader className="border-b px-6 py-6 sm:px-8">
            <CardTitle className="text-[20px] font-semibold leading-[1.3] text-[#334155]">
              {step === 1 ? "Basic Information" : "Review Information"}
            </CardTitle>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="px-6 py-8 sm:px-8">
              {step === 1 ? (
                <FieldGroup className="gap-6">
                  <Field>
                    <FieldLabel htmlFor="title">Online Test Title</FieldLabel>
                    <FieldContent>
                      <Input
                        id="title"
                        className="h-12 rounded-xl border-[#d1d5db] text-sm text-[#334155] focus-visible:border-[#6633ff] focus-visible:ring-[#6633ff]/10"
                        placeholder="Psychometric Test for Management Trainee Officer"
                        {...register("title")}
                      />
                      <FieldError errors={[errors.title]} />
                    </FieldContent>
                  </Field>

                  <div className="grid gap-6 md:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="totalCandidates">Total Candidates</FieldLabel>
                      <FieldContent>
                        <Input
                          id="totalCandidates"
                          className="h-12 rounded-xl border-[#d1d5db] text-sm text-[#334155] focus-visible:border-[#6633ff] focus-visible:ring-[#6633ff]/10"
                          min={1}
                          type="number"
                          {...register("totalCandidates")}
                        />
                        <FieldError errors={[errors.totalCandidates]} />
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="totalSlots">Total Slots</FieldLabel>
                      <FieldContent>
                        <Input
                          id="totalSlots"
                          className="h-12 rounded-xl border-[#d1d5db] text-sm text-[#334155] focus-visible:border-[#6633ff] focus-visible:ring-[#6633ff]/10"
                          min={1}
                          type="number"
                          {...register("totalSlots")}
                        />
                        <FieldError errors={[errors.totalSlots]} />
                      </FieldContent>
                    </Field>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="questionSets">Question Sets</FieldLabel>
                      <FieldContent>
                        <Input
                          id="questionSets"
                          className="h-12 rounded-xl border-[#d1d5db] text-sm text-[#334155] focus-visible:border-[#6633ff] focus-visible:ring-[#6633ff]/10"
                          min={1}
                          type="number"
                          {...register("questionSets")}
                        />
                        <FieldError errors={[errors.questionSets]} />
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel>Question Type</FieldLabel>
                      <FieldContent>
                        <Controller
                          control={control}
                          name="questionType"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-12 w-full rounded-xl border-[#d1d5db] px-4 text-sm text-[#334155] focus-visible:border-[#6633ff] focus-visible:ring-[#6633ff]/10">
                                <SelectValue placeholder="Select question type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="RADIO">MCQ</SelectItem>
                                  <SelectItem value="CHECKBOX">Checkbox</SelectItem>
                                  <SelectItem value="TEXT">Text</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <FieldError errors={[errors.questionType]} />
                      </FieldContent>
                    </Field>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="startTime">Start Time</FieldLabel>
                      <FieldContent>
                        <Input
                          id="startTime"
                          className="h-12 rounded-xl border-[#d1d5db] text-sm text-[#334155] focus-visible:border-[#6633ff] focus-visible:ring-[#6633ff]/10"
                          min={toDatetimeLocalValue(new Date())}
                          type="datetime-local"
                          {...register("startTime")}
                        />
                        <FieldError errors={[errors.startTime]} />
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="endTime">End Time</FieldLabel>
                      <FieldContent>
                        <Input
                          id="endTime"
                          className="h-12 rounded-xl border-[#d1d5db] text-sm text-[#334155] focus-visible:border-[#6633ff] focus-visible:ring-[#6633ff]/10"
                          min={values.startTime || toDatetimeLocalValue(new Date())}
                          type="datetime-local"
                          {...register("endTime")}
                        />
                        <FieldError errors={[errors.endTime]} />
                      </FieldContent>
                    </Field>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="durationMinutes">
                        Duration Per Slot (Minutes)
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id="durationMinutes"
                          className="h-12 rounded-xl border-[#d1d5db] text-sm text-[#334155] focus-visible:border-[#6633ff] focus-visible:ring-[#6633ff]/10"
                          min={1}
                          type="number"
                          {...register("durationMinutes")}
                        />
                        <FieldError errors={[errors.durationMinutes]} />
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="negativeMarking">Negative Marking</FieldLabel>
                      <FieldContent>
                        <Input
                          id="negativeMarking"
                          className="h-12 rounded-xl border-[#d1d5db] text-sm text-[#334155] focus-visible:border-[#6633ff] focus-visible:ring-[#6633ff]/10"
                          min={0}
                          step="0.25"
                          type="number"
                          {...register("negativeMarking")}
                        />
                        <FieldDescription>
                          Set `0` if there is no negative marking for this exam.
                        </FieldDescription>
                        <FieldError errors={[errors.negativeMarking]} />
                      </FieldContent>
                    </Field>
                  </div>
                </FieldGroup>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {reviewItems.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] px-5 py-4"
                    >
                      <p className="text-sm font-medium leading-6 text-[#64748b]">
                        {item.label}
                      </p>
                      <p className="mt-1 text-base font-semibold leading-7 text-[#334155]">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex items-center justify-between border-t bg-[#f8fafc] px-6 py-6 sm:px-8">
              {step === 1 ? (
                <>
                  <Button
                    asChild
                    className="h-12 rounded-xl border border-[#e5e7eb] bg-white px-8 text-[#334155] hover:bg-[#f8fafc]"
                    variant="outline"
                  >
                    <Link href="/dashboard">Cancel</Link>
                  </Button>
                  <Button
                    className="h-12 rounded-xl bg-[#6633ff] px-8 text-white hover:bg-[#5b2ef0]"
                    type="button"
                    onClick={handleNext}
                  >
                   Save & Continue
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="h-12 rounded-xl border border-[#e5e7eb] bg-white px-8 text-[#334155] hover:bg-[#f8fafc]"
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    className="h-12 rounded-xl bg-[#6633ff] px-8 text-white hover:bg-[#5b2ef0]"
                    disabled={createExamMutation.isPending || isSubmitting}
                    type="submit"
                  >
                    {createExamMutation.isPending || isSubmitting
                      ? "Creating..."
                      : "Create Exam"}
                  </Button>
                </>
              )}
            </CardFooter>
          </form>
        </Card>

        <div className="mx-auto min-h-6 text-center text-sm">
          <p className={errorMessage ? "text-red-600" : "text-emerald-600"}>
            {errorMessage || successMessage}
          </p>
        </div>
      </div>
    </section>
  );
}
