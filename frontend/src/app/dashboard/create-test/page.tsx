"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import OnlineTestForm from "@/components/form/OnlineTestForm";
import { useCreateExamMutation } from "@/hooks/api/useEmployer";
import { useAppSelector } from "@/hooks/useRedux";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  onlineTestDefaultValues,
  onlineTestSchema,
  type OnlineTestFormInput,
  type OnlineTestFormValues,
} from "@/lib/forms/online-test";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
    formState: { errors, isSubmitting },
  } = useForm<OnlineTestFormInput, unknown, OnlineTestFormValues>({
    resolver: zodResolver(onlineTestSchema),
    defaultValues: onlineTestDefaultValues,
  });

  const values = useWatch({ control }) as OnlineTestFormInput;
  const errorMessage = createExamMutation.error
    ? getApiErrorMessage(createExamMutation.error)
    : "";

  const formatNumericValue = (value: unknown, suffix?: string) => {
    if (typeof value !== "number") {
      return "Not set";
    }

    return suffix ? `${value} ${suffix}` : String(value);
  };

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
    setStep(2);
  };

  const onCreate = async (formValues: OnlineTestFormValues) => {
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
        <div className="mx-auto flex w-full max-w-238.5 flex-col gap-6 rounded-2xl border border-[#e5e7eb] bg-white p-8 text-center shadow-[0_2.714px_4.397px_rgba(192,192,192,0.03),0_6.863px_11.119px_rgba(192,192,192,0.04),0_13.999px_22.683px_rgba(192,192,192,0.05),0_28.836px_46.722px_rgba(192,192,192,0.06),0_79px_128px_rgba(192,192,192,0.09)]">
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
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
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

        <Card className="mx-auto w-full max-w-238.5 rounded-2xl border border-[#e5e7eb] py-0 shadow-[0_2.714px_4.397px_rgba(192,192,192,0.03),0_6.863px_11.119px_rgba(192,192,192,0.04),0_13.999px_22.683px_rgba(192,192,192,0.05),0_28.836px_46.722px_rgba(192,192,192,0.06),0_79px_128px_rgba(192,192,192,0.09)]">
          <CardHeader className="border-b px-6 py-6 sm:px-8">
            <CardTitle className="text-[20px] font-semibold leading-[1.3] text-[#334155]">
              {step === 1 ? "Basic Information" : "Review Information"}
            </CardTitle>
          </CardHeader>

          <CardContent className="px-6 py-8 sm:px-8">
            {step === 1 ? (
              <OnlineTestForm
                control={control}
                errors={errors}
                isSubmitting={isSubmitting}
                register={register}
                values={values}
                onCancel={() => router.push("/dashboard")}
                onSubmit={handleSubmit(handleNext)}
                submitLabel="Save & Continue"
                submittingLabel="Saving..."
              />
            ) : (
              <div className="space-y-6">
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

                <CardFooter className="flex items-center justify-between border-t bg-[#f8fafc] px-6 py-6 sm:px-8">
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
                    type="button"
                    onClick={handleSubmit(onCreate)}
                  >
                    {createExamMutation.isPending || isSubmitting
                      ? "Creating..."
                      : "Create Exam"}
                  </Button>
                </CardFooter>
              </div>
            )}
          </CardContent>
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
