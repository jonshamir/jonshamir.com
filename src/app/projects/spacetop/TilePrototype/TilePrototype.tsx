import "./TilePrototype.css";

import { useEffect } from "react";

import { initTiles } from "./interactions";

export default function TilePrototype() {
  useEffect(() => {
    initTiles();
  }, []);

  return (
    <div className="TilePrototype full-bleed">
      <div id="controls">
        <input type="checkbox" name="show-drag" id="show-drag" checked />
        <label htmlFor="show-drag">Show drag overlay</label>
        <br />
        <input type="checkbox" name="show-drag-tile" id="show-drag-tile" />
        <label htmlFor="show-drag-tile">Drag overlay is tile</label>
        <br />
        <input
          type="checkbox"
          name="resize-snap-all"
          id="resize-snap-all"
          checked
        />
        <label htmlFor="resize-snap-all">Resize snap to all tiles</label>
        <br />
        <input
          type="checkbox"
          name="resize-snap-existing"
          id="resize-snap-existing"
        />
        <label htmlFor="resize-snap-existing">
          Resize match existing sizes
        </label>
        <br />
        <input type="checkbox" name="show-gutters" id="show-gutters" />
        <label htmlFor="show-gutters">Show gutter margins</label>
        <br />
        <input type="number" name="snap-inside" id="snap-inside" value="25" />
        <label htmlFor="snap-inside">Snapping Threshold</label>
        <br />
        <input type="number" name="snap-outside" id="snap-outside" value="15" />
        <label htmlFor="snap-outside">Tile-to-tile Snapping</label>
      </div>
      <div id="tile-container">
        <div id="drag-tile">
          <div className="tile-content"></div>
        </div>
      </div>
    </div>
  );
}
