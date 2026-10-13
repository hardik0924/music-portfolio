"use client";

import { useEffect, useState } from "react";

import { assets, navLinks, type NavLink } from "./content";

function Link({ link }: { link: NavLink }) {
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer">
        {link.label}
      </a>
    );
  }
  return <a href={link.href}>{link.label}</a>;
}

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav id="nav" aria-label="Main navigation" className={scrolled ? "scrolled" : undefined}>
        <a href="#hero" className="nav-logo">
          <img src={assets.navLogo} alt="AG Live" width={38} height={38} />
        </a>
        <ul className="nav-links">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link link={link} />
            </li>
          ))}
        </ul>
        <a href="#book" className="nav-cta">
          Book AG Live
        </a>
        <button
          type="button"
          id="hamburger"
          className="nav-hamburger"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
      </nav>

      {menuOpen ? (
        <div id="mobile-nav">
          <ul>
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className={link.external ? "gold" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#book" className="mobile-nav-cta" onClick={() => setMenuOpen(false)}>
            Book AG Live
          </a>
        </div>
      ) : null}
    </>
  );
}