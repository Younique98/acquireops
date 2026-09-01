"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export const DeletePropertyButton = ({ id }: { id: number }) => {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="px-4 py-2 rounded-full border border-line text-sm font-semibold text-status-criticalText hover:border-status-critical transition"
      >
        Delete
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-ink-secondary">Delete this property?</span>
      <button
        type="button"
        disabled={isDeleting}
        onClick={async () => {
          setIsDeleting(true);
          await fetch(`/api/properties/${id}`, { method: "DELETE" });
          router.push("/dashboard/properties");
          router.refresh();
        }}
        className="px-3 py-1.5 rounded-full bg-status-critical text-white text-sm font-semibold disabled:opacity-60"
      >
        {isDeleting ? "Deleting..." : "Confirm"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="px-3 py-1.5 rounded-full border border-line text-sm font-semibold text-ink-secondary"
      >
        Cancel
      </button>
    </div>
  );
};
