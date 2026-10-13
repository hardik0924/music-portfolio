"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

import { CustomCursor } from "./custom-cursor";

/**
 * Owns every page-wide behaviour the source document sets up in its first inline
 * script: Lenis inertia, GSAP/ScrollTrigger reveals + counters + parallax, the
 * staggered logo entrance, the hero entrance timeline and the custom cursor.
 *
 * Sections stay server components; this queries the rendered tree by the same
 * class names the source uses.
 */
export function PageShell({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let cleanupCursor: (() => void) | undefined;

    gsap.registerPlugin(ScrollTrigger);

    // ── Lenis smooth scroll ──────────────────────────────────────────────
    // The source drives Lenis from its own rAF loop *and* from gsap.ticker
    // (Lenis 1.1.14 has no autoRaf), so both are kept to match the feel.
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.lagSmoothing(0);

    let ownLoop = true;
    const lenisFromRaf = (time: number) => lenis.raf(time);
    const rafLoop = (time: number) => {
      if (!ownLoop) return;
      lenis.raf(time);
      window.requestAnimationFrame(rafLoop);
    };
    window.requestAnimationFrame(rafLoop);
    gsap.ticker.add(lenisFromRaf);

    // ── Custom cursor ────────────────────────────────────────────────────
    const dot = root.querySelector<HTMLElement>("#cursor-dot");
    const ring = root.querySelector<HTMLElement>("#cursor-ring");
    let cursorLoop = true;
    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;

    const canHover = window.matchMedia("(hover: hover)").matches;
    if (canHover && dot && ring) {
      const onMove = (event: MouseEvent) => {
        mx = event.clientX;
        my = event.clientY;
      };
      window.addEventListener("mousemove", onMove, { passive: true });

      const animateCursor = () => {
        if (!cursorLoop) return;
        dot.style.left = `${mx}px`;
        dot.style.top = `${my}px`;
        rx += (mx - rx) * 0.1;
        ry += (my - ry) * 0.1;
        ring.style.left = `${rx}px`;
        ring.style.top = `${ry}px`;
        window.requestAnimationFrame(animateCursor);
      };
      window.requestAnimationFrame(animateCursor);

      const hoverTargets = root.querySelectorAll<HTMLElement>(
        "a, button, .tab-btn, .logo-cell",
      );
      const enter = () => root.classList.add("cursor-hover");
      const leave = () => root.classList.remove("cursor-hover");
      hoverTargets.forEach((el) => {
        el.addEventListener("mouseenter", enter);
        el.addEventListener("mouseleave", leave);
      });

      cleanupCursor = () => {
        window.removeEventListener("mousemove", onMove);
        hoverTargets.forEach((el) => {
          el.removeEventListener("mouseenter", enter);
          el.removeEventListener("mouseleave", leave);
        });
      };
    }

    // ── Scroll + entrance animations ─────────────────────────────────────
    const ctx = gsap.context(() => {
      gsap.set([".hero-subtitle", ".hero-actions"], { y: 18 });

      const runHeroIntro = () => {
        gsap
          .timeline({ delay: 0.15 })
          .to(".hero-eyebrow", { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" })
          .to(
            ".hero-title .word",
            { y: "0%", duration: 1.2, ease: "power3.out", stagger: 0.14 },
            "-=0.6",
          )
          .to(
            ".hero-subtitle",
            { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" },
            "-=0.7",
          )
          .to(
            ".hero-actions",
            { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
            "-=0.65",
          )
          .to(".hero-scroll", { opacity: 1, duration: 0.5 }, "-=0.4");
      };

      // Start after webfonts settle so the timeline does not play against a
      // fallback face and leave the hero mid-reveal in screenshots.
      const fontsReady = document.fonts?.ready ?? Promise.resolve();
      void fontsReady.then(() => {
        if (document.readyState === "complete") runHeroIntro();
        else window.addEventListener("load", runHeroIntro, { once: true });
      });

      gsap.utils.toArray<HTMLElement>(".reveal-inner").forEach((el) => {
        gsap.to(el, {
          y: "0%",
          duration: 1.05,
          ease: "power3.out",
          scrollTrigger: { trigger: el.parentElement, start: "top 88%" },
        });
      });

      gsap.utils.toArray<HTMLElement>(".stat-num[data-target]").forEach((el) => {
        const target = Number(el.dataset.target);
        const suffix = el.dataset.suffix ?? "";
        ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: () => {
            gsap.to({ v: 0 }, {
              v: target,
              duration: 1.9,
              ease: "power2.out",
              onUpdate() {
                el.textContent = `${Math.round(this.targets()[0].v as number)}${suffix}`;
              },
            });
          },
        });
      });

      gsap.utils
        .toArray<HTMLImageElement>(".act-photo-wrap img, .band-img-wrap img")
        .forEach((img) => {
          gsap.to(img, {
            yPercent: -7,
            ease: "none",
            scrollTrigger: {
              trigger: img.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        });

      gsap.from(".logo-cell", {
        opacity: 0,
        y: 16,
        stagger: 0.05,
        duration: 0.65,
        ease: "power2.out",
        scrollTrigger: { trigger: ".logo-grid", start: "top 88%" },
      });
    }, root);

    return () => {
      ownLoop = false;
      cursorLoop = false;
      cleanupCursor?.();
      gsap.ticker.remove(lenisFromRaf);
      ctx.revert();
      lenis.destroy();
    };
  }, []);

  return (
    <div ref={rootRef} className="ag-live">
      {children}
      <CustomCursor />
    </div>
  );
}