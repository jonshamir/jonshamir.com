"use client";

import { useRef, Children, type ReactNode } from "react";
import { useDragScroll } from "../../hooks/useDragScroll";
import styles from "./SideScroller.module.css";

interface SideScrollerProps {
  children: ReactNode;
  className?: string;
}

export function SideScroller({ children, className }: SideScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useDragScroll(scrollRef);

  return (
    <div className={`${styles.container}${className ? ` ${className}` : ""}`}>
      <div className={styles.scroller} ref={scrollRef}>
        {Children.map(children, (child) => (
          <div className={styles.item}>{child}</div>
        ))}
      </div>
    </div>
  );
}
