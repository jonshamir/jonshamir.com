import "./TilePrototype.css";

import { useEffect, useRef } from "react";

export default function TilePrototype() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cleanup: (() => void) | undefined;
    const el = containerRef.current;
    void import("./interactions").then(({ initTiles }) => {
      if (el.isConnected) {
        cleanup = initTiles(el);
      }
    });
    return () => cleanup?.();
  }, []);

  return (
    <div className="TilePrototype" ref={containerRef}>
      <div className="tile-container">
        <div className="drag-tile">
          <div className="tile-content"></div>
        </div>
      </div>
    </div>
  );
}
