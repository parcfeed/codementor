"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { ReportCard } from "@/features/moderation/components/report-card";
import { extractErrorMessage } from "@/lib/api-client";

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
  const [error, setError] = useState<string | null>(null);

  async function handleUpdateStatus(
    reportId: string,
    status: "REVIEWED" | "DISMISSED",
  ) {
    const response = await fetch(`/api/reports/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    setError(null);

    if (response.ok) {
      setLocalReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status } : r)),
      );

      router.refresh();
    } else {
      const payload = await response.json().catch(() => ({}));
      setError(extractErrorMessage(payload, "Erreur lors de la mise a jour."));
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

      {error ? (
        <div
          aria-live="polite"
          className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
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
