"use client";

import { useEffect, useState } from "react";

const FADE_AFTER_MS = 5500;
const REMOVE_AFTER_MS = 6200;

/**
 * Mirrors the source's `?thankyou=1` toast: it fades out at 5.5s and is gone by
 * 6.2s. Mounted only while the toast should be visible.
 */
export function ThankYouToast({ message }: { message: string }) {
  const [phase, setPhase] = useState<"shown" | "fading" | "done">("shown");

  useEffect(() => {
    const fade = window.setTimeout(() => setPhase("fading"), FADE_AFTER_MS);
    const done = window.setTimeout(() => setPhase("done"), REMOVE_AFTER_MS);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(done);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div id="toast" style={phase === "fading" ? { opacity: 0 } : undefined}>
      {message}
    </div>
  );
}