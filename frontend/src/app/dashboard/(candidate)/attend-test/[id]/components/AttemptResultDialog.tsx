"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AttemptResultDialogProps = {
  open: boolean;
  title: string;
  description: string;
  icon: ReactNode;
  iconWrapperClassName: string;
};

export default function AttemptResultDialog({
  open,
  title,
  description,
  icon,
  iconWrapperClassName,
}: AttemptResultDialogProps) {
  const router = useRouter();

  return (
    <Dialog open={open}>
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] rounded-2xl border border-[#e5e7eb] p-0 sm:max-w-[calc(100%-2rem)]"
        showCloseButton={false}
      >
        <div className="flex flex-col items-center px-8 py-12 text-center w-full">
          <div
            className={`mb-4 flex size-20 items-center justify-center rounded-full ${iconWrapperClassName}`}
          >
            {icon}
          </div>

          <DialogHeader className="items-center">
            <DialogTitle className="text-[32px] font-semibold text-[#334155]">
              {title}
            </DialogTitle>
            <DialogDescription className="max-w-xl text-sm leading-7 text-[#64748b]">
              {description}
            </DialogDescription>
          </DialogHeader>

          <Button
            className="mt-8 h-11 rounded-xl border border-[#e5e7eb] bg-white px-7 text-[#024cb3] hover:bg-[#f8fafc]"
            onClick={() => router.push("/dashboard")}
            variant="outline"
          >
            Back to Dashboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
