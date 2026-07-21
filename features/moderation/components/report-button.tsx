"use client";

import { useState } from "react";

import { ReportDialog } from "@/features/moderation/components/report-dialog";

type ReportButtonProps = {
  reviewId: string;
};

export function ReportButton({ reviewId }: ReportButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <button
        aria-label="Signaler cette review"
        className="text-xs text-muted-foreground underline transition hover:text-destructive"
        type="button"
        onClick={() => setShowDialog(true)}
      >
        Signaler
      </button>

      {showDialog ? (
        <ReportDialog
          reviewId={reviewId}
          onClose={() => setShowDialog(false)}
        />
      ) : null}
    </>
  );
}
