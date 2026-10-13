import { clientLogos, pressLinks } from "./content";
import { RevealTitle } from "./reveal-title";
import { ReviewsBlock } from "./reviews-block";

export function Clients() {
  return (
    <section id="clients" aria-labelledby="clients-h">
      <p className="section-eyebrow">Trusted By</p>
      <RevealTitle id="clients-h" lines={["The Rooms That", "Chose AG Live."]} />

      <p className="clients-intro">
        {"From JW Marriott's New Year gala to Suzlon's leadership summit \u2014 India's top event managers keep calling back."}
      </p>

      <div className="logo-grid">
        {clientLogos.map((logo) => (
          <div
            className="logo-cell"
            key={logo.src}
            style={logo.logoBg ? ({ "--logo-bg": logo.logoBg } as React.CSSProperties) : undefined}
          >
            <img src={logo.src} alt={logo.alt} loading="lazy" />
          </div>
        ))}
      </div>

      <div className="press-strip">
        <p className="press-eyebrow">As Featured In</p>
        <div className="press-row">
          {pressLinks.map((item) => (
            <a
              className="press-cell"
              key={item.src}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              style={
                item.logoBg ? ({ "--logo-bg": item.logoBg } as React.CSSProperties) : undefined
              }
            >
              <img src={item.src} alt={item.alt} loading="lazy" />
            </a>
          ))}
        </div>
      </div>

      <ReviewsBlock />
    </section>
  );
}