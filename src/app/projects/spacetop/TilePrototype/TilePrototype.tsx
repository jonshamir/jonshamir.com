import "./TilePrototype.css";

import { useEffect, useRef } from "react";

interface TilePrototypeProps {
  showDragOverlay?: boolean;
  dragOverlayIsTile?: boolean;
  resizeSnapAll?: boolean;
  resizeSnapExisting?: boolean;
  snapThreshold?: number;
  tileToTileSnapping?: number;
}

export default function TilePrototype({
  showDragOverlay = true,
  dragOverlayIsTile = true,
  resizeSnapAll = false,
  resizeSnapExisting = false,
  snapThreshold = 25,
  tileToTileSnapping = 15
}: TilePrototypeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cleanup: (() => void) | undefined;
    const el = containerRef.current;
    const config = {
      showDragOverlay,
      dragOverlayIsTile,
      resizeSnapAll,
      resizeSnapExisting,
      snapThreshold,
      tileToTileSnapping
    };
    void import("./interactions").then(({ initTiles }) => {
      if (el.isConnected) {
        cleanup = initTiles(el, config);
      }
    });
    return () => cleanup?.();
  }, [
    showDragOverlay,
    dragOverlayIsTile,
    resizeSnapAll,
    resizeSnapExisting,
    snapThreshold,
    tileToTileSnapping
  ]);

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
