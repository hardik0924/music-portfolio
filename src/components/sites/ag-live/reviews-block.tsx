"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { seedReviews, type Review } from "./content";
import { saveLocalReview, useLocalReviews } from "./local-reviews-store";
import { fetchApprovedReviews } from "./supabase-read";

const AUTOPLAY_MS = 5000;

/**
 * Review carousel + submission form.
 *
 * Approved reviews are read live from the same public table the source reads.
 * Reviews submitted here are kept locally (see local-reviews-store) rather than
 * written back to the live owner's database.
 */
export function ReviewsBlock() {
  const [remote, setRemote] = useState<Review[]>([]);
  const local = useLocalReviews();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchPaused = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    fetchApprovedReviews(controller.signal).then((result) => {
      if (controller.signal.aborted || !result.ok) return;
      setRemote(
        result.data
          .filter((row) => row.name && row.review)
          .map<Review>((row, index) => ({
            id: `remote-${index}-${row.name}`,
            name: row.name as string,
            stars: 5,
            review: row.review as string,
          })),
      );
    });

    return () => controller.abort();
  }, []);

  const slides = [...seedReviews, ...local, ...remote];

  const goTo = useCallback(
    (index: number) => {
      setCurrent(((index % slides.length) + slides.length) % slides.length);
    },
    [slides.length],
  );

  // Autoplay, paused while the visitor is reading (hover on pointer devices,
  // first touch on touch devices) exactly like the source.
  useEffect(() => {
    if (slides.length < 2) return;
    const tick = () => {
      if (paused || touchPaused.current) return;
      setCurrent((index) => (index + 1) % slides.length);
    };
    timer.current = setInterval(tick, AUTOPLAY_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
    };
  }, [slides.length, paused]);

  const handleTouchStart = () => {
    touchPaused.current = true;
    if (timer.current) clearInterval(timer.current);
  };

  return (
    <div className="reviews-wrap">
      <div
        className="reviews-carousel"
        id="reviewsCarousel"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={handleTouchStart}
      >
        {slides.length > 1 ? (
          <>
            <button
              type="button"
              id="reviewsPrev"
              className="t-arrow t-arrow-left"
              aria-label="Previous review"
              onClick={() => goTo(current - 1)}
            >
              &#10094;
            </button>
            <button
              type="button"
              id="reviewsNext"
              className="t-arrow t-arrow-right"
              aria-label="Next review"
              onClick={() => goTo(current + 1)}
            >
              &#10095;
            </button>
          </>
        ) : null}

        {slides.map((slide, index) => (
          <div className={`t-slide${index === current ? " active" : ""}`} key={slide.id}>
            <div className="t-stars" aria-label={`${slide.stars} out of 5 stars`}>
              {"\u2605".repeat(slide.stars)}
            </div>
            <blockquote className="t-quote">{slide.review}</blockquote>
            <div className="t-name">{slide.name}</div>
            {slide.role ? <div className="t-role">{slide.role}</div> : null}
          </div>
        ))}

        {slides.length > 1 ? (
          <div className="t-dots" id="reviewsDots">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                className={`t-dot${index === current ? " active" : ""}`}
                aria-label={`Show review ${index + 1}`}
                onClick={() => goTo(index)}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="reviews-cta-row">
        <a href="#add-review" className="btn-ghost">
          Add Your Review
        </a>
        <a href="#book" className="btn-primary">
          Send an Enquiry &nbsp;&rarr;
        </a>
      </div>

      <ReviewForm />
    </div>
  );
}

function ReviewForm() {
  const [status, setStatus] = useState<{ text: string; tone: "ok" | "err" } | null>(null);
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const text = String(data.get("review") ?? "").trim();
    if (!name || !text) return;

    setBusy(true);
    setStatus({ text: "Submitting...", tone: "ok" });

    window.setTimeout(() => {
      saveLocalReview({ id: `local-${Date.now()}`, name, stars: 5, review: text });
      formRef.current?.reset();
      setBusy(false);
      setStatus({
        text: "Thank you! Your review has been submitted for approval.",
        tone: "ok",
      });
    }, 400);
  };

  return (
    <div className="reviews-form-card" id="add-review">
      <p className="rf-eyebrow">Share Your Experience</p>
      <h3 className="rf-title">Add a Review</h3>
      <form id="reviewForm" ref={formRef} onSubmit={handleSubmit}>
        <div className="rf-group">
          <label htmlFor="rv-name">Your Name / Company Name</label>
          <input
            id="rv-name"
            name="name"
            type="text"
            placeholder="Full name or company name"
            required
            maxLength={80}
          />
        </div>
        <div className="rf-group">
          <label htmlFor="rv-text">Your Review</label>
          <textarea
            id="rv-text"
            name="review"
            placeholder="Tell us about your experience with AG Live..."
            required
            maxLength={600}
          />
        </div>
        <button className="rf-submit" type="submit" id="rv-submit" disabled={busy}>
          Submit Review
        </button>
        <p className={`rf-status${status ? ` ${status.tone}` : ""}`} id="rv-status">
          {status?.text ?? ""}
        </p>
        <p className="rf-note">Your review appears on the site right away.</p>
      </form>
    </div>
  );
}