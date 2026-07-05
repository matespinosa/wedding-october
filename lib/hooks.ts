"use client";

import { useEffect, useMemo, useState } from "react";

export type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  passed: boolean;
};

function diff(target: number): TimeLeft {
  const ms = target - Date.now();
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true };
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    passed: false,
  };
}

/** Live countdown to a target date. Starts null on the server to avoid a
 *  hydration mismatch, then ticks every second on the client. */
export function useCountdown(target: Date): TimeLeft | null {
  const time = target.getTime();
  const [left, setLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setLeft(diff(time));
    const id = window.setInterval(() => setLeft(diff(time)), 1000);
    return () => window.clearInterval(id);
  }, [time]);

  return left;
}

/** Tracks which section id is currently in the middle band of the viewport. */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  const key = useMemo(() => ids.join(","), [ids]);

  useEffect(() => {
    const sections = key
      .split(",")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [key]);

  return active;
}

/** True on devices with a fine pointer (mouse/trackpad) — gates hover-only effects. */
export function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setFine(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setFine(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return fine;
}
