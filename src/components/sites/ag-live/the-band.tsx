import { assets } from "./content";
import { RevealTitle } from "./reveal-title";

export function TheBand() {
  return (
    <section id="the-band" aria-labelledby="band-h">
      <p className="section-eyebrow">The People</p>
      <RevealTitle id="band-h" lines={["The Band Behind", "the Sound."]} />

      <div className="band-grid">
        {assets.band.map((image) => (
          <div className="band-img-wrap short" key={image.src}>
            <img src={image.src} alt={image.alt} loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  );
}