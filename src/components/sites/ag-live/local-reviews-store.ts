"use client";

import { useSyncExternalStore } from "react";

import type { Review } from "./content";

const STORAGE_KEY = "ag-live:local-reviews";
const CHANGE_EVENT = "ag-live:local-reviews-change";

function isReview(value: unknown): value is Review {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Review).id === "string" &&
    typeof (value as Review).name === "string" &&
    typeof (value as Review).review === "string"
  );
}

function parse(raw: string): Review[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isReview) : [];
  } catch {
    return [];
  }
}

function getSnapshot() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/**
 * Reviews submitted through the clone's own form. The source persists them in
 * Supabase; keeping them in localStorage preserves the "appears on the site
 * right away" behaviour without writing to the live owner's database.
 */
export function useLocalReviews(): Review[] {
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => "");
  return parse(raw);
}

export function saveLocalReview(review: Review) {
  const next = [review, ...parse(getSnapshot())];
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    /* storage unavailable — the review still shows for this visit */
  }
}