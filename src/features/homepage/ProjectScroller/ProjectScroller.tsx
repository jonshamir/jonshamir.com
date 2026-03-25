"use client";

import clsx from "clsx";

import { SideScroller } from "../../../components/SideScroller/SideScroller";
import styles from "./ProjectScroller.module.css";

export function ProjectScroller() {
  return (
    <SideScroller>
      <div className={styles.item}>
        <div className={styles.itemContent}>
          <h2>Spacetop</h2>
          <p>Augmented reality laptop OS</p>
          <span className="arrow">→</span>
        </div>
        <img
          src="/projects/spacetop/hero.png"
          alt="Spacetop"
          className={styles.itemMedia}
        />
      </div>
      <div className={styles.item}>
        <div className={styles.itemContent}>
          <h2>Muser</h2>
          <p>Smart music visualizer</p>
          <span className="arrow">→</span>
        </div>
        <img
          src="/projects/muser/hero.png"
          alt="Muser"
          className={styles.itemMedia}
        />
      </div>
      <div className={styles.item}>
        <div className={clsx(styles.itemContent, styles.darkContent)}>
          <h2>Widgets Bar</h2>
          <p>Customizable widgets bar</p>
          <span className="arrow">→</span>
        </div>
        <img
          src="/projects/widgets/screenshot.png"
          alt="Widgets Bar"
          className={styles.itemMedia}
        />
      </div>
      <div className={styles.item}>
        <div className={clsx(styles.itemContent, styles.darkContent)}>
          <h2>Leaf Map</h2>
          <p>Interactive botanical visualization</p>
          <span className="arrow">→</span>
        </div>
        <img
          src="/projects/leaf-map/hero.png"
          alt="Leaf Map"
          className={styles.itemMedia}
        />
      </div>
    </SideScroller>
  );
}
