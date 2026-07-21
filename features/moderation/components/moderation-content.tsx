"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { ReportCard } from "@/features/moderation/components/report-card";

type Report = {
  id: string;
  reason: string;
  status: "PENDING" | "REVIEWED" | "DISMISSED";
  createdAt: Date;
  reporter: { id: string; name: string };
  review: {
    id: string;
    rating: number;
    reviewer: { id: string; name: string };
    snippet: { id: string; language: string };
  };
};

type ModerationContentProps = {
  reports: Report[];
};

export function ModerationContent({ reports }: ModerationContentProps) {
  const router = useRouter();
  const [localReports, setLocalReports] = useState(reports);

  async function handleUpdateStatus(
    reportId: string,
    status: "REVIEWED" | "DISMISSED",
  ) {
    const response = await fetch(`/api/reports/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      setLocalReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status } : r)),
      );

      router.refresh();
    }
  }

  const pendingReports = localReports.filter((r) => r.status === "PENDING");
  const reviewedReports = localReports.filter((r) => r.status !== "PENDING");

  return (
    <>
      {pendingReports.length > 0 ? (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            En attente ({pendingReports.length})
          </h2>

          <div className="flex flex-col gap-3">
            {pendingReports.map((report) => (
              <ReportCard
                key={report.id}
                id={report.id}
                reason={report.reason}
                status={report.status}
                createdAt={report.createdAt}
                reporterName={report.reporter.name}
                reviewerName={report.review.reviewer.name}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        </div>
      ) : null}

      {reviewedReports.length > 0 ? (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Archive ({reviewedReports.length})
          </h2>

          <div className="flex flex-col gap-3">
            {reviewedReports.map((report) => (
              <ReportCard
                key={report.id}
                id={report.id}
                reason={report.reason}
                status={report.status}
                createdAt={report.createdAt}
                reporterName={report.reporter.name}
                reviewerName={report.review.reviewer.name}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        </div>
      ) : null}

      {localReports.length === 0 ? (
        <EmptyState
          title="Aucun signalement pour le moment"
          description="Les signalements de reviews non constructives apparaitront ici."
        />
      ) : null}
    </>
  );
}
