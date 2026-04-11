"use client";

import { CircleX, Clock3, FileText, MonitorPlay, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export type DashboardExamCard = {
  id: string;
  title: string;
  candidatesLabel: string;
  questionSetLabel: string;
  examSlotsLabel: string;
  negativeMarkingLabel?: string;
  actionLabel: string;
};

type OnlineTestCardProps = {
  exam: DashboardExamCard;
  isEmployer: boolean;
};

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm leading-6">
      <span className="text-[#a0aec0]">{icon}</span>
      <span className="text-[#7c8493]">{label}</span>
      <span className="font-medium text-[#334155]">{value}</span>
    </div>
  );
}

const OnlineTestCard = ({ exam, isEmployer }: OnlineTestCardProps) => {
  const router = useRouter();
  return (
    <article className="flex min-h-44 flex-col justify-between rounded-2xl border border-[#e5e7eb] bg-white px-6 py-6 shadow-[0_2.714px_4.397px_rgba(192,192,192,0.03),0_6.863px_11.119px_rgba(192,192,192,0.04),0_13.999px_22.683px_rgba(192,192,192,0.05),0_28.836px_46.722px_rgba(192,192,192,0.06),0_79px_128px_rgba(192,192,192,0.09)]">
      <div className="flex flex-col gap-5">
        <h2 className="text-[20px] font-semibold leading-[1.4] text-[#334155]">
          {exam.title}
        </h2>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          {isEmployer ? (
            <>
              <Stat
                icon={<Users className="size-4.5" />}
                label="Candidates:"
                value={exam.candidatesLabel}
              />
              <Stat
                icon={<FileText className="size-4.5" />}
                label="Question Set:"
                value={exam.questionSetLabel}
              />
              <Stat
                icon={<MonitorPlay className="size-4.5" />}
                label="Exam Slots:"
                value={exam.examSlotsLabel}
              />
            </>
          ) : (
            <>
              <Stat
                icon={<Clock3 className="size-4.5" />}
                label="Duration:"
                value={exam.candidatesLabel}
              />
              <Stat
                icon={<FileText className="size-4.5" />}
                label="Question:"
                value={exam.questionSetLabel}
              />
              <Stat
                icon={<CircleX className="size-4.5" />}
                label="Negative Marking:"
                value={exam.negativeMarkingLabel ?? exam.examSlotsLabel}
              />
            </>
          )}
        </div>
      </div>

      <div className="pt-6">
        <Button
          onClick={() =>
            router.push(
              isEmployer
                ? `/dashboard/info-view/${exam.id}`
                : `/dashboard/attend-test/${exam.id}`,
            )
          }
          className="h-11 rounded-xl border border-[#6633ff] bg-white px-10 text-sm font-semibold text-[#6633ff] shadow-none hover:bg-[#f7f3ff]"
          variant="outline"
        >
          {isEmployer ? "View Candidates" : exam.actionLabel}
        </Button>
      </div>
    </article>
  );
};

export default OnlineTestCard;
