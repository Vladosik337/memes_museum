import Link from "next/link";
import React, { useState } from "react";
import { LeaveReviewModal as LeaveReviewForm } from "./LeaveReviewModal";

type QuickActionsProps = {
  ticketCount: number;
  onDownloadAll: () => void;
};

export const QuickActions: React.FC<QuickActionsProps> = ({
  ticketCount,
  onDownloadAll,
}) => {
  const [showReview, setShowReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  return (
    <div className="dashboard-card rounded-xl shadow-lg p-6">
      {!showReview && (
        <>
          <Link
            href="/ticket-purchase-page"
            className="w-full block bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors mb-4 text-center"
          >
            Придбати новий квиток
          </Link>
          <button
            className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition-colors mb-4"
            onClick={onDownloadAll}
            disabled={ticketCount === 0}
          >
            Завантажити всі квитки (PDF)
          </button>
          <button
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
            onClick={() => setShowReview(true)}
          >
            Залишити відгук
          </button>
        </>
      )}
      {showReview && (
        <LeaveReviewForm
          isOpen={true}
          onClose={() => setShowReview(false)}
          onSuccess={() => setReviewSuccess(true)}
        />
      )}
      {reviewSuccess && (
        <div className="mt-4 text-green-700 bg-green-100 rounded p-2 text-center">
          Відгук успішно відправлено!
          <button
            className="ml-2 text-green-900 underline"
            onClick={() => setReviewSuccess(false)}
          >
            Закрити
          </button>
        </div>
      )}
    </div>
  );
};
