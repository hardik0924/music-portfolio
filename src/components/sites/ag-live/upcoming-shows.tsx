"use client";

import { useEffect, useState } from "react";

import { RevealTitle } from "./reveal-title";
import { fetchBookings, type BookingRow } from "./supabase-read";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

type State =
  | { status: "loading" }
  | { status: "ready"; rows: BookingRow[] }
  | { status: "error" };

type MonthGroup = { key: string; label: string; rows: BookingRow[] };

function titleCase(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function dayLabel(row: BookingRow): string {
  if (row.day) return row.day.substring(0, 3).toUpperCase();
  if (row.year && row.month && row.date) {
    return DAYS[new Date(row.year, row.month - 1, row.date).getDay()].toUpperCase();
  }
  return "";
}

function groupByMonth(rows: BookingRow[]): MonthGroup[] {
  const groups = new Map<string, BookingRow[]>();
  rows.forEach((row) => {
    const key = `${row.year}-${String(row.month).padStart(2, "0")}`;
    const bucket = groups.get(key);
    if (bucket) bucket.push(row);
    else groups.set(key, [row]);
  });

  return [...groups.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, groupRows]) => {
      const [year, month] = key.split("-");
      return { key, label: `${MONTHS[Number(month) - 1]} ${year}`, rows: groupRows };
    });
}

export function UpcomingShows() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    const now = new Date();
    const year = now.getFullYear();
    const firstMonth = now.getMonth() + 1;
    const months: number[] = [];
    for (let i = 0; i < 3; i += 1) {
      const month = firstMonth + i;
      if (month <= 12) months.push(month);
    }

    fetchBookings(year, months, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (!result.ok) {
        setState({ status: "error" });
        return;
      }

      // The source keeps only today-and-later entries.
      const today = now.getDate();
      const upcoming = result.data.filter((row) => {
        if (row.year !== year) return (row.year ?? 0) > year;
        if (row.month !== firstMonth) return (row.month ?? 0) > firstMonth;
        return (row.date ?? 0) >= today;
      });

      setState({ status: "ready", rows: upcoming });
    });

    return () => controller.abort();
  }, []);

  return (
    <section id="upcoming" aria-labelledby="upcoming-h">
      <p className="section-eyebrow">On Stage</p>
      <RevealTitle id="upcoming-h" lines={["Where to", "Find AG Live."]} />

      <div id="shows-container" className="shows-container">
        {state.status === "loading" ? (
          <p className="shows-loading">Loading upcoming shows&hellip;</p>
        ) : null}

        {state.status === "error" ? (
          <p className="shows-empty">Could not load shows. Please check back later.</p>
        ) : null}

        {state.status === "ready" && state.rows.length === 0 ? (
          <p className="shows-empty">No upcoming shows listed — check back soon.</p>
        ) : null}

        {state.status === "ready" && state.rows.length > 0
          ? groupByMonth(state.rows).map((group) => (
              <div key={group.key}>
                <p className="shows-month-label">{group.label}</p>
                {group.rows.map((row, index) => (
                  <div
                    className="show-row"
                    key={`${group.key}-${row.date ?? index}-${row.venue ?? ""}`}
                  >
                    <div className="show-date-box">
                      <div className="show-date-num">{row.date ?? "?"}</div>
                      <div className="show-date-day">{dayLabel(row)}</div>
                    </div>
                    <div>
                      <div className="show-venue">{titleCase(row.venue || "TBA")}</div>
                      <div className="show-meta">
                        {row.slot ?? ""}
                        {row.type ? ` · ${row.type}` : ""}
                      </div>
                    </div>
                    <div className="show-type-badge">{row.type || "LIVE"}</div>
                  </div>
                ))}
              </div>
            ))
          : null}
      </div>
    </section>
  );
}