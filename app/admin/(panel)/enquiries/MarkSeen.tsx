"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { markSeen } from "./actions";

/** Moves a new enquiry to "Seen" once its page is open, then refreshes so the menu count drops. */
export function MarkSeen({ id }: { id: number }) {
  const router = useRouter();
  useEffect(() => {
    markSeen(id).then(() => router.refresh());
  }, [id, router]);
  return null;
}
