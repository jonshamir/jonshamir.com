import interact from "interactjs";
import {
  DIRS,
  TOP,
  BOTTOM,
  LEFT,
  RIGHT,
  VERTICAL,
  HORIZONTAL,
  oppositeDir,
  dirOrientation,
  dirToString,
  dirSign,
  Rect
} from "./utils";
const { abs } = Math;

export function initTiles() {
  if (window.DID_INIT_TILES) return;
  window.DID_INIT_TILES = true;
  window.RESIZE_SNAP_EVERYTHING = false;
  window.RESIZE_SNAP_EXISTING_SIZES = true;
  window.SNAP_THRESHOLD = 25;
  window.PAD = 15; // Tile outside padding for snapping

  const CENTER_SNAP_MIN_SIZE = window.SNAP_THRESHOLD * 10;
  const MIN_TILE_SIZE = 60;

  const tiles = [0, 1, 2, 3].map((i) => {
    const x = i * 220;
    const y = 0;
    const h = 120;
    const w = 160;
    let rect = new Rect(x, y, w, h);
    rect.id = i;
    rect.docked = null;

    return rect;
  });

  let dragRect = new Rect();

  const tileContainer = document.getElementById("tile-container");
  const dragRectEl = document.getElementById("drag-tile");

  tiles.forEach((tileData) => {
    const { id, x, y, w, h } = tileData;
    const tile = document.createElement("div");
    tile.id = "tile-" + id;
    tile.classList.add("tile");
    const tileContent = document.createElement("div");
    tileContent.classList.add("tile-content");
    tileContent.innerHTML = id;

    tile.append(tileContent);
    Object.assign(tile.style, {
      width: `${w}px`,
      height: `${h}px`,
      transform: `translate(${x}px, ${y}px)`
    });
    Object.assign(tile.dataset, { id });

    tileContainer.append(tile);
  });

  function noTileCollisions(rect, excludeTile) {
    return tiles.every(
      (tile) => tile === excludeTile || !tile.isColliding(rect)
    );
  }

  function tryResolveCollisions(currRect, collidedTiles, resolvedDirs) {
    let didCollide = false;
    let collisionTile = -1;

    let optRects = []; // Resolving options
    let optDists = DIRS.map((d) => Infinity);

    for (const t of tiles) {
      if (!collidedTiles.includes(t)) {
        if (!currRect.isColliding(t, window.PAD)) continue; // No collision

        didCollide = true;
        collisionTile = t;
        const newCollidedTiles = [...collidedTiles, t];

        // Test all resolution directions and pick the best one
        DIRS.forEach((dir) => {
          if (!resolvedDirs.includes[oppositeDir(dir)]) {
            const newResolvedDirs = [...resolvedDirs, dir];

            let currOptRect = new Rect(currRect);
            currOptRect.setEdge(dir, t.getEdge(oppositeDir(dir)));

            currOptRect = tryResolveCollisions(
              currOptRect,
              newCollidedTiles,
              newResolvedDirs
            );

            let currOptRectSnapped = new Rect(currOptRect);
            currOptRectSnapped = applySnapping(
              currOptRectSnapped,
              t,
              dirOrientation(dir)
            );

            // First try snapped then unsnapped rect
            if (noTileCollisions(currOptRectSnapped, collidedTiles[0])) {
              optRects[dir] = currOptRectSnapped;
              optDists[dir] = currRect.centerSqrDist(currOptRectSnapped);
            } else if (noTileCollisions(currOptRect, collidedTiles[0])) {
              optRects[dir] = currOptRect;
              optDists[dir] = currRect.centerSqrDist(currOptRect);
            }
          }
        });

        break;
      }
    }

    let finalRect = currRect;

    if (didCollide) {
      const bestDir = optDists.indexOf(Math.min.apply(Math, optDists));
      finalRect = optRects[bestDir];
      finalRect.docked = collisionTile;
    }

    return finalRect;
  }

  function applySnapping(currRect, collidedRect, snapOrientation) {
    const cXinside = collidedRect.xContains(currRect.cX);
    const cYinside = collidedRect.yContains(currRect.cY);

    if (snapOrientation === HORIZONTAL) {
      const topDist = abs(dragRect.t - collidedRect.t);
      const bottomDist = abs(dragRect.b - collidedRect.b);
      const centerDist = abs(dragRect.cY - collidedRect.cY);
      if (topDist < window.SNAP_THRESHOLD) currRect.t = collidedRect.t;
      else if (bottomDist < window.SNAP_THRESHOLD) currRect.b = collidedRect.b;
      // Center snapping
      else if (cYinside && centerDist < window.SNAP_THRESHOLD)
        currRect.cY = collidedRect.cY;
    }
    if (snapOrientation === VERTICAL) {
      const leftDist = abs(dragRect.l - collidedRect.l);
      const rightDist = abs(dragRect.r - collidedRect.r);
      const centerDist = abs(dragRect.cX - collidedRect.cX);
      if (leftDist < window.SNAP_THRESHOLD) currRect.l = collidedRect.l;
      else if (rightDist < window.SNAP_THRESHOLD) currRect.r = collidedRect.r;
      // Center snapping
      else if (cXinside && centerDist < window.SNAP_THRESHOLD)
        currRect.cX = collidedRect.cX;
    }

    return currRect;
  }

  function dragTile(id, step) {
    dragRect.x += step.x;
    dragRect.y += step.y;

    const finalRect = tryResolveCollisions(dragRect, [tiles[id]], []);

    tiles[id].copy(finalRect);
    tiles[id].docked = finalRect.docked;
  }

  function resizeTile(id, event) {
    const { deltaRect, rect, edges } = event;
    dragRect.x += deltaRect.left;
    dragRect.y += deltaRect.top;
    dragRect.w = rect.width;
    dragRect.h = rect.height;

    let resizingEdges = [];
    if (edges.top) resizingEdges.push(TOP);
    if (edges.bottom) resizingEdges.push(BOTTOM);
    if (edges.left) resizingEdges.push(LEFT);
    if (edges.right) resizingEdges.push(RIGHT);

    let finalRect = new Rect(dragRect);

    // Resize snapping
    let snappingCandidates = [];
    if (window.RESIZE_SNAP_EVERYTHING) snappingCandidates = tiles;
    else if (tiles[id].docked) snappingCandidates.push(tiles[id].docked);

    snappingCandidates.forEach((t) => {
      if (t.id != id) {
        resizingEdges.forEach((dir) => {
          const orientation = dirOrientation(dir);
          const centerPoint = orientation === HORIZONTAL ? t.cX : t.cY;
          const otherTileSize = orientation === HORIZONTAL ? t.w : t.h;
          const dragRectSize =
            orientation === HORIZONTAL ? dragRect.w : dragRect.h;

          if (
            abs(dragRect.getEdge(dir) - t.getEdge(dir)) < window.SNAP_THRESHOLD
          )
            finalRect.resizeEdge(dir, t.getEdge(dir));
          else if (
            otherTileSize > CENTER_SNAP_MIN_SIZE &&
            abs(dragRect.getEdge(dir) - centerPoint) < window.SNAP_THRESHOLD / 2
          )
            finalRect.resizeEdge(dir, centerPoint);
          else if (
            window.RESIZE_SNAP_EXISTING_SIZES &&
            abs(dragRectSize - otherTileSize) < window.SNAP_THRESHOLD
          ) {
            let newEdge = finalRect.getEdge(oppositeDir(dir));
            newEdge += dirSign(dir) * otherTileSize;
            finalRect.resizeEdge(dir, newEdge);
          }
        });
      }
    });

    // Collisions
    let didCollide = false;
    let collisionTiles = {};
    let collisionDists = DIRS.map((d) => Infinity); // Saves distances from static edge to collision edge

    for (const t of tiles) {
      if (id != t.id) {
        if (!dragRect.isColliding(t)) continue; // No collision
        didCollide = true;

        resizingEdges.forEach((dir) => {
          const sign = dirSign(dir);
          const resizeEdge = finalRect.getEdge(dir);
          const staticEdge = finalRect.getEdge(oppositeDir(dir));
          const collisionEdge = t.getEdge(oppositeDir(dir));
          const collisionDist = sign * (collisionEdge - staticEdge);

          // Choose the collision edge closest to the static edge
          if (collisionDist < collisionDists[dir]) {
            collisionTiles[dir] = t;
            collisionDists[dir] = collisionDist;
          }
        });
      }
    }

    if (didCollide) {
      const collisionDirs = Object.keys(collisionTiles);

      if (collisionDirs.length === 1) {
        const dir = parseInt(collisionDirs[0]);
        const collisionEdge = collisionTiles[dir].getEdge(oppositeDir(dir));
        finalRect.resizeEdge(dir, collisionEdge);
      } else {
        let resolutionOpts = [];

        resizingEdges.forEach((dir) => {
          let rectOpt = new Rect(finalRect);
          const collisionEdge = collisionTiles[dir].getEdge(oppositeDir(dir));
          rectOpt.resizeEdge(dir, collisionEdge);
          resolutionOpts.push(rectOpt);
        });

        const dir1 = resizingEdges[0];
        const dir2 = resizingEdges[1];

        let rectOpt = new Rect(finalRect);
        rectOpt.resizeEdge(
          dir2,
          collisionTiles[dir1].getEdge(oppositeDir(dir2))
        );
        rectOpt.resizeEdge(
          dir1,
          collisionTiles[dir2].getEdge(oppositeDir(dir1))
        );
        resolutionOpts.push(rectOpt);

        // Worst case scenario - both axes collided
        let worstOpt = new Rect(finalRect);
        worstOpt.resizeEdge(
          dir1,
          collisionTiles[dir1].getEdge(oppositeDir(dir1))
        );
        worstOpt.resizeEdge(
          dir2,
          collisionTiles[dir2].getEdge(oppositeDir(dir2))
        );

        finalRect = worstOpt;

        resolutionOpts.forEach((optRect) => {
          if (
            finalRect.area() < optRect.area() &&
            noTileCollisions(optRect, tiles[id]) &&
            optRect.w >= MIN_TILE_SIZE &&
            optRect.h >= MIN_TILE_SIZE
          ) {
            finalRect = optRect;
          }
        });
      }
    }

    // Aspect Ratio - always round down
    const aspectRatio = 4 / 3;
    if (aspectRatio > 0) {
      if (resizingEdges.length == 2) {
        const aspectFittedHeight = finalRect.w / aspectRatio;
        const aspectFittedWidth = finalRect.h * aspectRatio;
        if (aspectFittedHeight < finalRect.h) finalRect.h = aspectFittedHeight;
        else finalRect.w = aspectFittedWidth;
      }
    }

    // Apply resize
    tiles[id].copy(finalRect);
  }

  function initDragRect(event) {
    //Show free-moving drag indicator rect
    let { id } = event.target.dataset;
    dragRect.copy(tiles[id]);
    updateTile(dragRect, dragRectEl);
    dragRectEl.style.display = "block";
    event.target.classList.add("currently-dragging");
  }

  function hideDragRect(event) {
    dragRectEl.style.display = "none";
    event.target.classList.remove("currently-dragging");
  }

  interact(".tile")
    .draggable({
      // inertia: true,
      listeners: {
        start: initDragRect,
        end: hideDragRect,
        move(event) {
          const { id } = event.target.dataset;
          let step = { x: event.dx, y: event.dy };

          dragTile(id, step);
          updateTilePos(dragRect, dragRectEl);
          updateTilePos(tiles[id], event.target);
        }
      }
    })
    .resizable({
      edges: { top: true, left: true, bottom: true, right: true },
      listeners: {
        start: initDragRect,
        end: hideDragRect,
        move: function (event) {
          let { id } = event.target.dataset;

          resizeTile(id, event);
          updateTile(dragRect, dragRectEl);
          updateTile(tiles[id], event.target);
        }
      },
      modifiers: [
        interact.modifiers.restrictSize({
          min: { width: MIN_TILE_SIZE, height: MIN_TILE_SIZE }
        })
      ]
    });

  function updateTile(tile, el) {
    const { x, y, w, h } = tile;
    Object.assign(el.style, {
      width: `${w}px`,
      height: `${h}px`,
      transform: `translate(${x}px, ${y}px)`
    });
  }

  function updateTilePos(tile, el) {
    const { x, y } = tile;
    el.style.transform = `translate(${x}px, ${y}px)`;
  }
}
