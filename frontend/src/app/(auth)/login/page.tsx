"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLoginMutation } from "@/hooks/api/useAuth";
import { useAppDispatch } from "@/hooks/useRedux";
import { getApiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { setAuthUser } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

const loginSchema = z.object({
  email: z.email("Please enter a valid email address."),
  password: z.string().min(1, "Enter Password!."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const initialFormValues: LoginFormValues = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const loginMutation = useLoginMutation();
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: initialFormValues,
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSuccessMessage("");

    try {
      const response = await loginMutation.mutateAsync(values);
      dispatch(
        setAuthUser(response.user),
      );

      const destination = response.user.role === "EMPLOYER" ? "/dashboard" : "/dashboard";

      setSuccessMessage(`Signed in as ${response.user.name}. Redirecting...`);

      startTransition(() => {
        router.push(destination);
      });
    } catch {
      setSuccessMessage("");
    }
  };

  const errorMessage = loginMutation.error
    ? getApiErrorMessage(loginMutation.error)
    : "";

  return (
    <section className="relative flex min-h-[calc(100vh-10rem)] items-center justify-center overflow-hidden bg-[#f9fafb] px-4 py-10 text-slate-700 sm:px-6 sm:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),transparent_48%),linear-gradient(180deg,rgba(255,255,255,0.78)_0%,rgba(249,250,251,1)_70%)]" />
      <div
        className="relative z-10 flex w-full max-w-[571px] flex-col gap-6"
        data-node-id="1:934"
      >
        <div className="text-center">
          <h1
            className="text-[28px] font-semibold leading-[1.3] text-slate-700 sm:text-[32px]"
            data-node-id="1:935"
          >
            Sign In
          </h1>
        </div>

        <div
          className="rounded-2xl border border-[#e5e7eb] bg-white px-5 py-8 shadow-[0_79px_128px_0_rgba(192,192,192,0.09),0_28.836px_46.722px_0_rgba(192,192,192,0.06),0_13.999px_22.683px_0_rgba(192,192,192,0.05),0_6.863px_11.119px_0_rgba(192,192,192,0.04),0_2.714px_4.397px_0_rgba(192,192,192,0.03)] sm:px-8 sm:py-10"
          data-node-id="1:936"
        >
          <form className="space-y-10" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              <label className="block space-y-3" data-node-id="1:941">
                <span className="block text-sm font-medium leading-6 text-slate-700">
                  Email
                </span>
                <Input
                  aria-invalid={errors.email ? "true" : "false"}
                  autoComplete="email"
                  className={cn(
                    "h-12 rounded-lg border bg-white px-4 text-sm text-slate-700",
                    errors.email
                      ? "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500/10"
                      : "border-[#6b3df5]/10 focus-visible:border-[#6b3df5] focus-visible:ring-[#6b3df5]/10",
                  )}
                  placeholder="Your primary email address"
                  type="email"
                  {...register("email")}
                />
                <span className="min-h-5 text-sm text-red-600">
                  {errors.email?.message ?? ""}
                </span>
              </label>

              <div className="space-y-3" data-node-id="1:942">
                <label className="block space-y-3">
                  <span className="block text-sm font-medium leading-6 text-slate-700">
                    Password
                  </span>
                  <InputGroup
                    className={cn(
                      "h-12 rounded-lg bg-white",
                      errors.password
                        ? "border-red-400 has-[[data-slot=input-group-control]:focus-visible]:border-red-500 has-[[data-slot=input-group-control]:focus-visible]:ring-red-500/10"
                        : "border-[#d1d5db] has-[[data-slot=input-group-control]:focus-visible]:border-[#6b3df5] has-[[data-slot=input-group-control]:focus-visible]:ring-[#6b3df5]/10",
                    )}
                  >
                    <InputGroupInput
                      aria-invalid={errors.password ? "true" : "false"}
                      autoComplete="current-password"
                      className="h-12 px-4 text-sm text-slate-700"
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="text-slate-500 hover:text-slate-700"
                        size="icon-sm"
                        type="button"
                        variant="ghost"
                        onClick={() => setShowPassword((current) => !current)}
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  <span className="min-h-5 text-sm text-red-600">
                    {errors.password?.message ?? ""}
                  </span>
                </label>

                <div className="flex justify-end">
                  <Link
                    className="text-sm font-medium text-slate-600 transition hover:text-[#6b3df5]"
                    href="#"
                  >
                    Forget Password?
                  </Link>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                className="h-12 w-full rounded-xl border-0 bg-linear-to-r from-[#5d2de1] to-[#7437f7] text-base font-semibold text-white shadow-none hover:from-[#5427cf] hover:to-[#692fea]"
                disabled={loginMutation.isPending || isSubmitting}
                size="lg"
                type="submit"
              >
                {loginMutation.isPending || isSubmitting
                  ? "Submitting..."
                  : "Submit"}
              </Button>

              <p
                className={cn(
                  "min-h-5 text-center text-sm",
                  errorMessage ? "text-red-600" : "text-emerald-600",
                )}
              >
                {errorMessage || successMessage}
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
