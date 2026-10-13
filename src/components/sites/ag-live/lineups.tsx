"use client";

import { useState } from "react";

import { lineups, type LineupId } from "./content";
import { RevealTitle } from "./reveal-title";

export function Lineups() {
  const [active, setActive] = useState<LineupId>("trio");

  return (
    <section id="lineups" aria-labelledby="lineups-h">
      <p className="section-eyebrow">Format &amp; Scale</p>
      <RevealTitle id="lineups-h" lines={["Built for", "Every Stage."]} />

      <div className="lineup-tabs" role="tablist" aria-label="Band formats">
        {lineups.map((lineup) => (
          <button
            key={lineup.id}
            type="button"
            role="tab"
            className={`tab-btn${active === lineup.id ? " active" : ""}`}
            aria-selected={active === lineup.id}
            aria-controls={`panel-${lineup.id}`}
            onClick={() => setActive(lineup.id)}
          >
            {lineup.tab}
          </button>
        ))}
      </div>

      {lineups.map((lineup) => (
        <div
          key={lineup.id}
          id={`panel-${lineup.id}`}
          role="tabpanel"
          className={`tab-panel${active === lineup.id ? " active" : ""}`}
        >
          <div>
            <h3 className="panel-title">{lineup.title}</h3>
            <p className="panel-desc">{lineup.desc}</p>
            <p className="ideal-label">Ideal for</p>
            <p className="ideal-val">{lineup.idealFor}</p>
          </div>
          <ul className="members-list">
            {lineup.members.map((member) => (
              <li key={`${lineup.id}-${member.name}`}>
                <div className="m-icon">{member.icon}</div>
                <div>
                  <div className="m-name">{member.name}</div>
                  <div className="m-role">{member.role}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}