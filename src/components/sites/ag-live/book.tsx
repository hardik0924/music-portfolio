"use client";

import { useState } from "react";

import { bandFormats, contactItems, eventTypes, toastMessage } from "./content";
import { RevealTitle } from "./reveal-title";
import { ThankYouToast } from "./thank-you-toast";

export function Book() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // The source posts to formsubmit.co. The clone validates and completes
    // locally instead of emailing the live owner from a local build.
    event.preventDefault();
    event.currentTarget.reset();
    setSent(true);
  };

  return (
    <section id="book" aria-labelledby="book-h">
      <div className="book-info">
        <p className="section-eyebrow">Get in Touch</p>
        <RevealTitle
          id="book-h"
          lines={["Let's Make", "Something", "Unforgettable."]}
        />

        <ul className="contact-stack">
          {contactItems.map((item) => (
            <li key={item.label}>
              <div className="c-icon">{item.icon}</div>
              <div>
                <div className="c-label">{item.label}</div>
                <div className="c-val">
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                    >
                      {item.value}
                    </a>
                  ) : (
                    item.value
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <form className="inquiry-form" onSubmit={handleSubmit}>
          <div className="form-shell">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="f-name">Your Name</label>
                <input id="f-name" name="name" type="text" placeholder="Full name" required />
              </div>
              <div className="form-group">
                <label htmlFor="f-org">Company / Organisation</label>
                <input
                  id="f-org"
                  name="organisation"
                  type="text"
                  placeholder="Company or venue"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="f-email">Email</label>
                <input
                  id="f-email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="f-phone">Phone</label>
                <input id="f-phone" name="phone" type="tel" placeholder="+91 00000 00000" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="f-date">Event Date</label>
                <input id="f-date" name="event_date" type="date" />
              </div>
              <div className="form-group">
                <label htmlFor="f-format">Band Format</label>
                <select id="f-format" name="band_format" defaultValue="">
                  <option value="">Select format</option>
                  {bandFormats.map((format) => (
                    <option key={format}>{format}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="f-venue">Venue / City</label>
                <input
                  id="f-venue"
                  name="venue"
                  type="text"
                  placeholder="Venue name and city"
                />
              </div>
              <div className="form-group">
                <label htmlFor="f-type">Event Type</label>
                <select id="f-type" name="event_type" defaultValue="">
                  <option value="">Select type</option>
                  {eventTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group-wrap">
              <div className="form-group">
                <label htmlFor="f-msg">Additional Notes</label>
                <textarea
                  id="f-msg"
                  name="message"
                  placeholder="Tell us about your event -- theme, guest count, any special requirements..."
                />
              </div>
            </div>

            <button type="submit" className="form-submit">
              Send Inquiry &nbsp;&rarr;
            </button>
          </div>
        </form>
      </div>

      {sent ? <ThankYouToast message={toastMessage} /> : null}
    </section>
  );
}