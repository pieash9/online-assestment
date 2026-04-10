"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
} from "lucide-react";
import OnlineTestCard, {
  type DashboardExamCard,
} from "@/app/dashboard/components/OnlineTestCard";
import { useCandidateExamsQuery } from "@/hooks/api/useCandidate";
import { useEmployerExamsQuery } from "@/hooks/api/useEmployer";
import { useAppSelector } from "@/hooks/useRedux";
import {
  CandidateExamSummary,
  EmployerExamSummary,
} from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 4;

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {Array.from({ length: PAGE_SIZE }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-[#e5e7eb] bg-white px-6 py-6 shadow-[0_2.714px_4.397px_rgba(192,192,192,0.03),0_6.863px_11.119px_rgba(192,192,192,0.04),0_13.999px_22.683px_rgba(192,192,192,0.05),0_28.836px_46.722px_rgba(192,192,192,0.06),0_79px_128px_rgba(192,192,192,0.09)]"
        >
          <div className="flex flex-col gap-5">
            <Skeleton className="h-7 w-4/5 rounded-md" />
            <div className="flex flex-wrap gap-6">
              <Skeleton className="h-5 w-32 rounded-md" />
              <Skeleton className="h-5 w-32 rounded-md" />
              <Skeleton className="h-5 w-28 rounded-md" />
            </div>
            <Skeleton className="h-11 w-36 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

function normalizeEmployerExam(exam: EmployerExamSummary): DashboardExamCard {
  return {
    id: exam.id,
    title: exam.examName,
    candidatesLabel: exam.candidates ? exam.candidates.toLocaleString() : "Not Set",
    questionSetLabel: exam.questionSets ? String(exam.questionSets) : "Not Set",
    examSlotsLabel: exam.examSlots ? String(exam.examSlots) : "Not Set",
    actionLabel: "View Candidates",
  };
}

function normalizeCandidateExam(exam: CandidateExamSummary): DashboardExamCard {
  return {
    id: exam.id,
    title: exam.title,
    candidatesLabel: "Assigned",
    questionSetLabel: exam.questions ? String(exam.questions) : "Not Set",
    examSlotsLabel: exam.durationMinutes ? `${exam.durationMinutes} Min` : "Not Set",
    actionLabel: exam.status.toUpperCase() === "ACTIVE" ? "Start Test" : "View Details",
  };
}

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const authHydrated = useAppSelector((state) => state.auth.hydrated);
  const isEmployer = user?.role === "EMPLOYER";
  const isCandidate = user?.role === "CANDIDATE";

  const employerQuery: UseQueryResult<EmployerExamSummary[], Error> =
    useEmployerExamsQuery(isEmployer);
  const candidateQuery: UseQueryResult<CandidateExamSummary[], Error> =
    useCandidateExamsQuery(isCandidate);

  const [search, setSearch] = useState("");
  const [currentPageRaw, setCurrentPageRaw] = useState(1);

  const allExams = useMemo<DashboardExamCard[]>(() => {
    if (isEmployer) {
      return (employerQuery.data ?? []).map(normalizeEmployerExam);
    }

    if (isCandidate) {
      return (candidateQuery.data ?? []).map(normalizeCandidateExam);
    }

    return [];
  }, [candidateQuery.data, employerQuery.data, isCandidate, isEmployer]);

  const filteredExams = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return allExams;
    }

    return allExams.filter((exam) => exam.title.toLowerCase().includes(query));
  }, [allExams, search]);

  const totalPages = Math.max(1, Math.ceil(filteredExams.length / PAGE_SIZE));
  const currentPage = Math.min(currentPageRaw, totalPages);

  const paginatedExams = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredExams.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredExams]);

  const isLoading =
    !authHydrated || (isEmployer ? employerQuery.isLoading : candidateQuery.isLoading);
  const isError = isEmployer ? employerQuery.isError : candidateQuery.isError;

  return (
    <section className="min-h-[calc(100vh-10rem)] bg-[#f9fafb] px-4 py-14 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-4xl font-semibold leading-[1.3] text-[#334155]">
            Online Tests
          </h1>

          <div className="flex w-full flex-col gap-4 lg:w-auto lg:flex-row lg:items-center">
            <div className="relative w-full lg:w-[621px]">
              <Input
                className="h-12 rounded-lg border-[#a086f7] pr-14 pl-4 text-xs text-[#334155] shadow-[2px_2px_6px_rgba(73,123,241,0.24)] placeholder:text-[#7c8493]/50 focus-visible:border-[#6633ff] focus-visible:ring-[#6633ff]/10"
                placeholder="Search by exam title"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPageRaw(1);
                }}
              />
              <div className="pointer-events-none absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#673fed]/10 text-[#6633ff]">
                <Search className="size-4" />
              </div>
            </div>

            {isEmployer ? (
              <Button className="h-12 rounded-xl bg-[#6633ff] px-8 text-base font-semibold text-white shadow-none hover:bg-[#5b2ef0]">
                <Plus data-icon="inline-start" />
                Create Online Test
              </Button>
            ) : null}
          </div>
        </div>

        {isLoading ? (
          <DashboardSkeleton />
        ) : isError ? (
          <Empty className="rounded-2xl border-[#e5e7eb] bg-white py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search />
              </EmptyMedia>
              <EmptyTitle>Unable to load tests</EmptyTitle>
              <EmptyDescription>
                The dashboard could not fetch exam data for this account right now.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : paginatedExams.length === 0 ? (
          <Empty className="rounded-2xl border-[#e5e7eb] bg-white py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search />
              </EmptyMedia>
              <EmptyTitle>No online tests found</EmptyTitle>
              <EmptyDescription>
                {search
                  ? "Try another exam title."
                  : "Your available tests will show up here."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {paginatedExams.map((exam) => (
                <OnlineTestCard
                  key={exam.id}
                  exam={exam}
                  isEmployer={Boolean(isEmployer)}
                />
              ))}
            </div>

            <div className="flex flex-col gap-3 border-t border-[#e5e7eb] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-6">
                <Button
                  className="size-8 rounded-lg border border-[#f1f2f4] bg-white p-0 text-[#a0aec0] shadow-none hover:bg-[#f8f8f8]"
                  disabled={currentPage === 1}
                  variant="outline"
                  onClick={() => setCurrentPageRaw((page) => Math.max(1, page - 1))}
                >
                  <ChevronLeft />
                </Button>
                <div className="flex size-8 items-center justify-center rounded-[10px] bg-[#f8f8f8] text-xs font-semibold text-[#2e2e2f]">
                  {currentPage}
                </div>
                <Button
                  className="size-8 rounded-lg border border-[#f1f2f4] bg-white p-0 text-[#2e2e2f] shadow-none hover:bg-[#f8f8f8]"
                  disabled={currentPage === totalPages}
                  variant="outline"
                  onClick={() =>
                    setCurrentPageRaw((page) => Math.min(totalPages, page + 1))
                  }
                >
                  <ChevronRight />
                </Button>
              </div>

              <div className="flex items-center gap-4 self-end text-xs font-medium text-[#666666] sm:self-auto">
                <span>Online Test Per Page</span>
                <div className="flex h-8 items-center gap-2 rounded-lg border border-[#f1f2f4] bg-white px-3 text-xs text-[#2e2e2f]">
                  <span>8</span>
                  <ChevronRight className="size-4 rotate-[-90deg]" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
