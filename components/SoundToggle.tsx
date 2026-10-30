"use client";

import { useEffect, useState } from "react";
import { chime, startAmbient, stopAmbient } from "@/lib/ambient";

const KEY = "alvi-sound";

function readPref(): boolean {
  try {
    return localStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
}
function writePref(v: boolean) {
  try {
    localStorage.setItem(KEY, v ? "on" : "off");
  } catch {
    /* storage blocked: the choice simply is not remembered */
  }
}

/** Header switch for the ambient sound. Off by default; a remembered "on" waits for the first tap or click. */
export function SoundToggle({ className = "", dark = true }: { className?: string; dark?: boolean }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const onChapter = (e: Event) => chime((e as CustomEvent<number>).detail);
    window.addEventListener("alvi:chapter", onChapter);
    // Browsers only allow sound after a gesture, so a remembered "on" starts at the first one.
    let resume: (() => void) | null = null;
    if (readPref()) {
      resume = () => {
        void startAmbient().then(() => setOn(true));
        if (resume) window.removeEventListener("pointerdown", resume);
      };
      window.addEventListener("pointerdown", resume, { once: true });
    }
    return () => {
      window.removeEventListener("alvi:chapter", onChapter);
      if (resume) window.removeEventListener("pointerdown", resume);
      stopAmbient();
    };
  }, []);

  const toggle = async () => {
    const next = !on;
    setOn(next);
    writePref(next);
    if (next) await startAmbient();
    else stopAmbient();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      className={`group inline-flex min-h-11 items-center gap-2 text-xs tracking-[0.2em] uppercase ${className}`}
    >
      <span aria-hidden className="flex h-3 items-end gap-[2px]">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="sound-bar block w-[2px] bg-current" style={{ animationDelay: `${i * 0.15}s` }} data-on={on || undefined} />
        ))}
      </span>
      Sound
      <span aria-hidden className={dark ? "text-camel" : "text-camel-deep"}>{on ? "On" : "Off"}</span>
    </button>
  );
}
