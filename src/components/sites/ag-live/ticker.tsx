import { tickerItems } from "./content";

export function Ticker() {
  const loop = [...tickerItems, ...tickerItems];

  return (
    <div id="ticker" aria-hidden="true">
      <div className="ticker-track">
        {loop.map((item, index) => (
          <span className="ticker-item" key={`${item}-${index}`}>
            {item}
            <span className="ticker-sep" />
          </span>
        ))}
      </div>
    </div>
  );
}