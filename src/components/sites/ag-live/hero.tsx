"use client";

import { useRef, useState } from "react";

import { assets } from "./content";

const MUTED_ICON =
  '<polygon points="4,9 8,9 12,5.5 12,18.5 8,15 4,15" fill="currentColor" stroke="none"></polygon><line x1="16" y1="9" x2="21.5" y2="15"></line><line x1="21.5" y1="9" x2="16" y2="15"></line>';

const UNMUTED_ICON =
  '<polygon points="4,9 8,9 12,5.5 12,18.5 8,15 4,15" fill="currentColor" stroke="none"></polygon><path d="M16.5 8.5a5 5 0 0 1 0 7"></path><path d="M19 6a8.5 8.5 0 0 1 0 12"></path>';

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    if (!video.muted) void video.play().catch(() => {});
    setMuted(video.muted);
  };

  return (
    <section id="hero" aria-label="Hero">
      <video
        id="hero-video"
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={assets.heroPhoto}
      >
        <source src={assets.heroVideo} type="video/mp4" />
      </video>

      <button
        id="hero-mute-btn"
        type="button"
        onClick={toggleMute}
        aria-label={muted ? "Unmute video" : "Mute video"}
        aria-pressed={muted}
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          dangerouslySetInnerHTML={{ __html: muted ? MUTED_ICON : UNMUTED_ICON }}
        />
      </button>

      <div className="hero-overlay" />
      <div className="hero-overlay-top" />

      <div className="hero-content">
        <p className="hero-eyebrow">Pune &nbsp;·&nbsp; Mumbai &nbsp;·&nbsp; Pan India</p>
        <h1 className="hero-title">
          <span className="line">
            <span className="word">AMIT</span>
          </span>
          <span className="line">
            <span className="word">GAUR</span>
          </span>
        </h1>
        <p className="hero-subtitle">
          Twelve years. Five hundred stages.
          <br />
          One band that makes every room feel alive.
        </p>
        <div className="hero-actions">
          <a href="#book" className="btn-primary">
            Book AG Live &nbsp;&rarr;
          </a>
          <a href="#the-act" className="btn-ghost">
            Explore the Act
          </a>
        </div>
      </div>

      <div className="hero-scroll">
        <span className="hero-scroll-label">Scroll</span>
        <div className="scroll-bar" />
      </div>
    </section>
  );
}