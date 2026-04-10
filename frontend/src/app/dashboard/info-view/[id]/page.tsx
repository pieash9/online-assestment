"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import OnlineTestForm from "@/components/form/OnlineTestForm";
import { useEmployerExamQuery } from "@/hooks/api/useEmployer";
import { useAppSelector } from "@/hooks/useRedux";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  onlineTestDefaultValues,
  onlineTestSchema,
  questionTypeLabelMap,
  toLocalInputValue,
  type OnlineTestFormInput,
  type OnlineTestFormValues,
} from "@/lib/forms/online-test";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditTestPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const examId = typeof params.id === "string" ? params.id : "";
  const user = useAppSelector((state) => state.auth.user);
  const examQuery = useEmployerExamQuery(examId);

  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OnlineTestFormInput, unknown, OnlineTestFormValues>({
    resolver: zodResolver(onlineTestSchema),
    defaultValues: onlineTestDefaultValues,
  });

  useEffect(() => {
    if (!examQuery.data) {
      return;
    }

    reset({
      title: examQuery.data.title,
      totalCandidates: examQuery.data.totalCandidates,
      totalSlots: examQuery.data.totalSlots,
      questionSets: examQuery.data.questionSets,
      questionType:
        examQuery.data.questionType === "CHECKBOX" ||
        examQuery.data.questionType === "TEXT"
          ? examQuery.data.questionType
          : "RADIO",
      startTime: toLocalInputValue(examQuery.data.startTime),
      endTime: toLocalInputValue(examQuery.data.endTime),
      durationMinutes: examQuery.data.durationMinutes,
      negativeMarking: examQuery.data.negativeMarking,
    });
  }, [examQuery.data, reset]);

  const values = useWatch({ control }) as OnlineTestFormInput;

  const summaryItems = useMemo<Array<{ label: string; value: string }>>(
    () => [
      { label: "Online Test Title", value: values.title || "Not set" },
      {
        label: "Total Candidates",
        value:
          typeof values.totalCandidates === "number"
            ? values.totalCandidates.toLocaleString()
            : "Not set",
      },
      {
        label: "Total Slots",
        value:
          typeof values.totalSlots === "number"
            ? String(values.totalSlots)
            : "Not set",
      },
      {
        label: "Total Question Set",
        value:
          typeof values.questionSets === "number"
            ? String(values.questionSets)
            : "Not set",
      },
      {
        label: "Duration Per Slots (Minutes)",
        value:
          typeof values.durationMinutes === "number"
            ? String(values.durationMinutes)
            : "Not set",
      },
      {
        label: "Question Type",
        value: values.questionType ? questionTypeLabelMap[values.questionType] : "Not set",
      },
    ],
    [values],
  );

  const onSubmit = async () => {
    setSuccessMessage("Basic information is ready. Continue to the questions step.");
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (isEditing && examQuery.data) {
      reset({
        title: examQuery.data.title,
        totalCandidates: examQuery.data.totalCandidates,
        totalSlots: examQuery.data.totalSlots,
        questionSets: examQuery.data.questionSets,
        questionType:
          examQuery.data.questionType === "CHECKBOX" ||
          examQuery.data.questionType === "TEXT"
            ? examQuery.data.questionType
            : "RADIO",
        startTime: toLocalInputValue(examQuery.data.startTime),
        endTime: toLocalInputValue(examQuery.data.endTime),
        durationMinutes: examQuery.data.durationMinutes,
        negativeMarking: examQuery.data.negativeMarking,
      });
      setIsEditing(false);
      return;
    }

    router.push("/dashboard");
  };

  if (user?.role !== "EMPLOYER") {
    return (
      <section className="min-h-[calc(100vh-10rem)] bg-[#f9fafb] px-4 py-14 sm:px-6 lg:px-10">
        <div className="mx-auto flex w-full max-w-238.5 flex-col gap-6 rounded-2xl border border-[#e5e7eb] bg-white p-8 text-center shadow-[0_2.714px_4.397px_rgba(192,192,192,0.03),0_6.863px_11.119px_rgba(192,192,192,0.04),0_13.999px_22.683px_rgba(192,192,192,0.05),0_28.836px_46.722px_rgba(192,192,192,0.06),0_79px_128px_rgba(192,192,192,0.09)]">
          <h1 className="text-[28px] font-semibold leading-[1.3] text-[#334155]">
            Employer Access Only
          </h1>
          <p className="text-base leading-7 text-[#64748b]">
            Only employer accounts can manage online tests from this screen.
          </p>
          <div className="flex justify-center">
            <Button
              asChild
              className="h-12 rounded-xl bg-[#6633ff] px-8 text-white hover:bg-[#5b2ef0]"
            >
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
                  <div className="flex size-6 items-center justify-center rounded-full bg-[#f1f5f9] text-sm font-semibold text-[#64748b]">
                    2
                  </div>
                  <span className="font-medium text-[#64748b]">Questions</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                asChild
                className="h-10 rounded-xl border border-[#6633ff] bg-white px-6 text-[#6633ff] hover:bg-[#f7f3ff]"
                variant="outline"
              >
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>

        <Card className="mx-auto w-full max-w-238.5 rounded-2xl border border-[#e5e7eb] py-0 shadow-[0_2.714px_4.397px_rgba(192,192,192,0.03),0_6.863px_11.119px_rgba(192,192,192,0.04),0_13.999px_22.683px_rgba(192,192,192,0.05),0_28.836px_46.722px_rgba(192,192,192,0.06),0_79px_128px_rgba(192,192,192,0.09)]">
          <CardHeader className="px-6 py-6 sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-[20px] font-semibold leading-[1.3] text-[#334155]">
                Basic Information
              </CardTitle>
              <Button
                className="h-10 cursor-pointer rounded-xl border-none bg-white px-4 text-[#6633ff] hover:bg-[#f7f3ff]"
                type="button"
                variant="default"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="size-4" />
                Edit
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-6 py-8 sm:px-8">
            {examQuery.isLoading ? (
              <p className="text-sm text-[#64748b]">Loading exam information...</p>
            ) : examQuery.isError ? (
              <p className="text-sm text-red-600">{getApiErrorMessage(examQuery.error)}</p>
            ) : !isEditing ? (
              <div className="grid gap-4 md:grid-cols-2">
                {summaryItems.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] px-5 py-4"
                  >
                    <p className="text-sm font-medium leading-6 text-[#64748b]">{item.label}</p>
                    <p className="mt-1 text-base font-semibold leading-7 text-[#334155]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <OnlineTestForm
                control={control}
                errors={errors}
                formId="online-test-edit-form"
                isSubmitting={isSubmitting}
                register={register}
                showActions={false}
                values={values}
                onCancel={() => setIsEditing(false)}
                onSubmit={handleSubmit(onSubmit)}
                submitLabel="Save & Continue"
                submittingLabel="Saving..."
              />
            )}
          </CardContent>
        </Card>

        <Card className="mx-auto w-full max-w-238.5 rounded-2xl border border-[#e5e7eb] py-0 shadow-[0_2.714px_4.397px_rgba(192,192,192,0.03),0_6.863px_11.119px_rgba(192,192,192,0.04),0_13.999px_22.683px_rgba(192,192,192,0.05),0_28.836px_46.722px_rgba(192,192,192,0.06),0_79px_128px_rgba(192,192,192,0.09)]">
          <CardContent className="px-6 py-5 sm:px-8">
            <div className="flex items-center justify-between rounded-2xl bg-[#f8fafc] px-4 py-4 sm:px-6">
              <Button
                className="h-11 min-w-40 rounded-xl border border-[#d7dde7] bg-white px-8 text-[#334155] hover:bg-[#f8fafc]"
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                className="h-11 min-w-44 rounded-xl bg-[#6633ff] px-8 text-white hover:bg-[#5b2ef0]"
                disabled={isSubmitting}
                form="online-test-edit-form"
                type={isEditing ? "submit" : "button"}
                onClick={!isEditing ? () => setIsEditing(true) : undefined}
              >
                {isSubmitting ? "Saving..." : "Save & Continue"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mx-auto min-h-6 text-center text-sm">
          <p className={successMessage ? "text-emerald-600" : "text-[#64748b]"}>
            {successMessage}
          </p>
        </div>
      </div>
    </section>
  );
}
