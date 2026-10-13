"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { RevealTitle } from "./reveal-title";
import { fetchBookedDates } from "./supabase-read";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const SWIPE_THRESHOLD = 50;

type View = { month: number; year: number };

type Loaded = { key: string; status: "ready" | "error"; days: number[] };

function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

function firstDayOfWeek(month: number, year: number) {
  return new Date(year, month - 1, 1).getDay();
}

const EMPTY: Loaded = { key: "", status: "ready", days: [] };

export function AvailabilityCalendar() {
  const [today] = useState(() => new Date());
  const [view, setView] = useState<View>(() => ({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  }));

  // The in-flight status is derived from which month the loaded result belongs
  // to, so switching months shows "Loading…" without an extra render pass.
  const [loaded, setLoaded] = useState<Loaded>(EMPTY);
  const viewKey = `${view.year}-${view.month}`;
  const status = loaded.key === viewKey ? loaded.status : "loading";
  const bookedDates = new Set(loaded.key === viewKey ? loaded.days : []);

  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchBookedDates(view.year, view.month, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      setLoaded({
        key: viewKey,
        status: result.ok ? "ready" : "error",
        days: result.ok ? result.data : [],
      });
    });

    return () => controller.abort();
  }, [view.year, view.month, viewKey]);

  const step = useCallback((delta: number) => {
    setView((current) => {
      let month = current.month + delta;
      let year = current.year;
      if (month < 1) {
        month = 12;
        year -= 1;
      } else if (month > 12) {
        month = 1;
        year += 1;
      }
      return { month, year };
    });
  }, []);

  const isCurrentMonth =
    today.getFullYear() === view.year && today.getMonth() + 1 === view.month;
  const todayDate = isCurrentMonth ? today.getDate() : -1;

  const total = daysInMonth(view.month, view.year);
  const offset = firstDayOfWeek(view.month, view.year);

  return (
    <section id="ag-calendar" aria-labelledby="cal-h">
      <p className="section-eyebrow">Book A Date</p>
      <RevealTitle id="cal-h" lines={["AG's", "Availability."]} />

      <div className="cal-wrap">
        <div className="cal-header">
          <button
            type="button"
            id="cal-prev"
            className="cal-nav-btn"
            aria-label="Previous month"
            onClick={() => step(-1)}
          >
            &#8592;
          </button>
          <span className="cal-month-title" id="cal-month-title">
            {`${MONTH_NAMES[view.month - 1]} ${view.year}`}
          </span>
          <button
            type="button"
            id="cal-next"
            className="cal-nav-btn"
            aria-label="Next month"
            onClick={() => step(1)}
          >
            &#8594;
          </button>
        </div>

        <div className="cal-days-header">
          {DAY_HEADERS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div
          className="cal-grid"
          id="cal-grid"
          onTouchStart={(event) => {
            touchStartX.current = event.changedTouches[0].clientX;
          }}
          onTouchEnd={(event) => {
            const start = touchStartX.current;
            touchStartX.current = null;
            if (start === null) return;
            const dx = event.changedTouches[0].clientX - start;
            if (Math.abs(dx) < SWIPE_THRESHOLD) return;
            step(dx < 0 ? 1 : -1);
          }}
        >
          {status === "loading" ? (
            <p className="cal-loading">Loading&hellip;</p>
          ) : null}

          {status === "error" ? <p className="cal-loading">Could not load.</p> : null}

          {status === "ready"
            ? Array.from({ length: offset + total }, (_, index) => {
                const day = index - offset + 1;
                if (day < 1) return <div className="cal-cell" key={`blank-${index}`} />;

                const classes = ["cal-day"];
                classes.push(bookedDates.has(day) ? "booked" : "available");
                if (day === todayDate) classes.push("today-mark");

                return (
                  <div className="cal-cell" key={day}>
                    <div className={classes.join(" ")}>{day}</div>
                  </div>
                );
              })
            : null}
        </div>

        <div className="cal-legend">
          <div className="cal-legend-item">
            <div className="cal-legend-dot booked" />
            Confirmed Show
          </div>
          <div className="cal-legend-item">
            <div className="cal-legend-dot available" />
            Available
          </div>
        </div>
      </div>
    </section>
  );
}