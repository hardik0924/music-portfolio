import { Fragment } from "react";

/**
 * Section heading whose lines slide up from a clipped mask on scroll.
 * PageShell wires the `.reveal-inner` tweens, matching the source exactly.
 */
export function RevealTitle({
  id,
  lines,
}: {
  id?: string;
  lines: readonly string[];
}) {
  return (
    <h2 className="section-title" id={id}>
      {lines.map((line, index) => (
        <Fragment key={line}>
          {index > 0 ? <br /> : null}
          <span className="reveal-wrap">
            <span className="reveal-inner">{line}</span>
          </span>
        </Fragment>
      ))}
    </h2>
  );
}