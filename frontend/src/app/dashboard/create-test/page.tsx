"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import QuestionSetStep from "@/components/dashboard/QuestionSetStep";
import OnlineTestForm from "@/components/form/OnlineTestForm";
import {
  useCreateExamMutation,
  useEmployerExamQuery,
  useUpdateExamMutation,
} from "@/hooks/api/useEmployer";
import { useAppSelector } from "@/hooks/useRedux";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  onlineTestDefaultValues,
  onlineTestSchema,
  type OnlineTestFormInput,
  type OnlineTestFormValues,
} from "@/lib/forms/online-test";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateTestPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const createExamMutation = useCreateExamMutation();
  const updateExamMutation = useUpdateExamMutation();

  const [step, setStep] = useState<1 | 2>(1);
  const [createdExamId, setCreatedExamId] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const createdExamQuery = useEmployerExamQuery(createdExamId);

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

  const onSubmitBasicInfo = async (formValues: OnlineTestFormValues) => {
    setSuccessMessage("");

    try {
      const payload = {
        ...formValues,
        startTime: new Date(formValues.startTime).toISOString(),
        endTime: new Date(formValues.endTime).toISOString(),
      };

      if (!createdExamId) {
        const createdExam = await createExamMutation.mutateAsync(payload);
        setCreatedExamId(createdExam.id);
        setSuccessMessage("Basic information saved. Add questions now.");
      } else {
        await updateExamMutation.mutateAsync({ examId: createdExamId, payload });
        setSuccessMessage("Basic information updated. Continue with questions.");
      }

      setStep(2);
    } catch {
      setSuccessMessage("");
    }
  };

  const handleCancel = () => {
    router.push("/dashboard");
  };

  const isMutationError = createExamMutation.isError || updateExamMutation.isError;
  const mutationErrorMessage = createExamMutation.isError
    ? getApiErrorMessage(createExamMutation.error)
    : updateExamMutation.isError
      ? getApiErrorMessage(updateExamMutation.error)
      : "";

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
                    {step === 2 ? <Check className="size-3.5" /> : "1"}
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
                    Questions Sets
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

        {step === 1 ? (
          <Card className="mx-auto w-full max-w-238.5 rounded-2xl border border-[#e5e7eb] py-0 shadow-[0_2.714px_4.397px_rgba(192,192,192,0.03),0_6.863px_11.119px_rgba(192,192,192,0.04),0_13.999px_22.683px_rgba(192,192,192,0.05),0_28.836px_46.722px_rgba(192,192,192,0.06),0_79px_128px_rgba(192,192,192,0.09)]">
            <CardHeader className="border-b px-6 py-6 sm:px-8">
              <CardTitle className="text-[20px] font-semibold leading-[1.3] text-[#334155]">
                Basic Information
              </CardTitle>
            </CardHeader>

            <CardContent className="px-6 py-8 sm:px-8">
              <OnlineTestForm
                control={control}
                errors={errors}
                formId="create-exam-basic-form"
                isSubmitting={isSubmitting || createExamMutation.isPending || updateExamMutation.isPending}
                register={register}
                showActions={false}
                values={values}
                onCancel={handleCancel}
                onSubmit={handleSubmit(onSubmitBasicInfo)}
                submitLabel="Save & Continue"
                submittingLabel="Saving..."
              />
            </CardContent>
          </Card>
        ) : (
          <QuestionSetStep
            defaultQuestionType={values.questionType}
            examId={createdExamId}
            questions={createdExamQuery.data?.questions ?? []}
          />
        )}

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
                disabled={isSubmitting || createExamMutation.isPending || updateExamMutation.isPending}
                form="create-exam-basic-form"
                type={step === 1 ? "submit" : "button"}
                onClick={() => {
                  if (step === 2) {
                    startTransition(() => {
                      router.push("/dashboard");
                      router.refresh();
                    });
                  }
                }}
              >
                {step === 2
                  ? "Finish"
                  : createExamMutation.isPending || updateExamMutation.isPending || isSubmitting
                    ? "Saving..."
                    : "Save & Continue"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mx-auto min-h-6 text-center text-sm">
          <p className={isMutationError ? "text-red-600" : "text-emerald-600"}>
            {isMutationError ? mutationErrorMessage : successMessage}
          </p>
        </div>
      </div>
    </section>
  );
}
