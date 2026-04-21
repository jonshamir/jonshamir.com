"use client";

import { LOG_KINDS } from "./constants";
import styles from "./LogPalette.module.css";
import type { LogKind } from "./types";

const KINDS: LogKind[] = ["twig", "stick", "log", "fat-log"];

export function LogPalette({
  active,
  onSelect,
  onClear,
  logCount
}: {
  active: LogKind | null;
  onSelect: (kind: LogKind) => void;
  onClear: () => void;
  logCount: number;
}) {
  return (
    <div className={styles.palette}>
      <div className={styles.header}>
        <span>Place a log</span>
        <span className={styles.count}>{logCount} placed</span>
      </div>
      <div className={styles.items}>
        {KINDS.map((k) => {
          const kind = LOG_KINDS[k];
          return (
            <button
              key={k}
              className={active === k ? styles.itemActive : styles.item}
              onClick={() => onSelect(k)}
              style={{ ["--log-color" as string]: kind.color }}
            >
              <div
                className={styles.swatch}
                style={{
                  height: `${Math.max(6, kind.radius * 220)}px`,
                  width: `${Math.min(72, kind.length * 220)}px`
                }}
              />
              <span>{kind.label}</span>
            </button>
          );
        })}
      </div>
      {active && (
        <button className={styles.cancel} onClick={onClear}>
          Cancel placing ({LOG_KINDS[active].label})
        </button>
      )}
      <div className={styles.hint}>
        Click a log type, then click the ground. Click a placed log to grab and
        drag it.
      </div>
    </div>
  );
}
