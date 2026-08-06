import { clsx } from "clsx";
import Link from "next/link";

import { CanvasTile } from "./CanvasTile";
import styles from "./ExperimentGrid.module.css";
import { ExperimentItem, experiments } from "./experiments";
import { VideoTile } from "./VideoTile";

const spanClass = { 1: styles.span1, 2: styles.span2, 3: styles.span3 };

function Media({ item }: { item: ExperimentItem }) {
  switch (item.kind) {
    case "image":
      return <img src={item.src} alt={item.alt} loading="lazy" />;
    case "video":
      return <VideoTile src={item.src} />;
    case "canvas":
      return <CanvasTile scene={item.scene} />;
  }
}

export function ExperimentGrid() {
  return (
    <div className={styles.experimentGrid}>
      {experiments.map((item) => {
        const className = clsx(styles.tile, spanClass[item.span]);
        const content = (
          <figure>
            <div
              className={styles.media}
              style={{ aspectRatio: item.aspectRatio }}
            >
              <Media item={item} />
            </div>
            <figcaption>{item.caption}</figcaption>
          </figure>
        );
        return item.href ? (
          <Link key={item.id} href={item.href} className={className}>
            {content}
          </Link>
        ) : (
          <div key={item.id} className={className}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
