# Topo Lab Page — Design

## Overview

A new lab page at `/lab/topo` implementing Rune Skovbo Johansen's "Fast and Gorgeous Erosion Filter" (blog.runevision.com, March 2026) in Three.js. The page offers a toggle between a 3D eroded-terrain view and a 2D heightmap view, both driven by the same ported GLSL filter and a shared Leva parameter panel.

## Reference

- Blog post: https://blog.runevision.com/2026/03/fast-and-gorgeous-erosion-filter.html
- Source of GLSL: "Advanced Terrain Erosion Filter" Shadertoy (https://www.shadertoy.com/view/wXcfWn) — the user will paste the Common + Image tab source during implementation (Shadertoy blocks automated fetch).

## Goals

- Full-fidelity port of the Shadertoy's filter: stacked faded gullies, analytical derivatives, ridge/crease rounding controls.
- Two views of the same filter output — 3D orbitable terrain and flat 2D heightmap — switched via a toggle.
- Live parameter tweaking through Leva.
- Visual style lighter than `moon`/`earth`: neutral background, no post-processing.

## Non-goals

- No CPU/baked terrain — filter runs live on the GPU each frame.
- No render-to-texture intermediate pass (approach A chosen; B held in reserve if performance requires).
- No unit tests — this is a visual lab page, matching the rest of `src/app/lab/`.
- No colormap/ramp customization beyond grayscale in the 2D view for v1.
- No ridge-map output visualization in v1 (the filter internally can produce one; we only consume the eroded height + gradient).

## File layout

```
src/app/lab/topo/
  page.mdx              # title, intro, <Canvas />
  TopoCanvas.tsx        # orchestrator: ThreeCanvas + Leva + 2D/3D toggle
  TerrainMesh.tsx       # 3D view: subdivided plane with terrainMaterial
  HeightmapQuad.tsx     # 2D view: fullscreen quad with heightmapMaterial
  erosionShader.ts      # ported Shadertoy GLSL as an exported string
  terrainMaterial.ts    # ShaderMaterial for 3D (vertex displacement + shading)
  heightmapMaterial.ts  # ShaderMaterial for 2D (fragment grayscale)
  uniforms.ts           # shared uniforms object + Leva → uniform wiring helpers
```

Route resolves automatically to `/lab/topo`. MDX structure mirrors `src/app/lab/moon/page.mdx`.

## Shader architecture (approach A: shared GLSL, per-vertex/per-pixel)

`erosionShader.ts` exports a single GLSL chunk string containing:

1. The Shadertoy's Common-tab helpers and constants (renamed if they collide).
2. A single entry point:
   ```glsl
   // returns (height, dHeight/dx, dHeight/dy)
   vec3 erodedTerrain(vec2 uv);
   ```
   built from the Shadertoy's `mainImage` body, stripped of `fragColor` / `fragCoord` / `iResolution` / `iTime` references.
3. Uniform declarations for every parameter the Shadertoy exposes as a hardcoded knob (see "Uniforms & controls" below).

Both materials include this chunk by string-concatenation into their shader source.

### `terrainMaterial.ts` (3D)

- **Vertex shader:** compute `vec3 ht = erodedTerrain(uv)`; displace position along the plane's up-axis by `ht.x * uDisplacementScale`; pass `ht.yz` (gradient) and `uv` as varyings.
- **Fragment shader:** reconstruct normal analytically from gradient (`normalize(vec3(-gx, -gy, 1.0))` then transformed into world space), apply simple Lambert-style shading with a fixed directional light, optional subtle altitude-based tint.

### `heightmapMaterial.ts` (2D)

- **Vertex shader:** pass-through full-screen quad.
- **Fragment shader:** `float h = erodedTerrain(vUv).x`; output `vec4(vec3(h), 1.0)` (optionally remapped to [0,1] via `uHeightRange` uniforms).

Both materials share the same `THREE.IUniform` instances from `uniforms.ts`, so Leva updates propagate to both views without remount.

## Uniforms & controls

A single `useControls` call in `TopoCanvas.tsx`, organized into folders. Every slider writes into the shared `uniforms` object's `.value`. Exact parameter names mirror the Shadertoy's to ease the port.

- **Base height** — amplitude, frequency, octaves of the Shadertoy's built-in base function. Kept identical to the Shadertoy's defaults as the starting point.
- **Erosion** — strength, lacunarity, octave count, detail.
- **Shape** — gully weight, ridge rounding, crease rounding, fade target.
- **Rendering** — displacement scale (3D only), plus any boolean toggles the Shadertoy exposes (e.g. straight gullies, normalized gullies) surfaced as `bool` uniforms.

If the pasted Shadertoy source exposes additional parameters not listed above, they are added to the appropriate Leva folder during implementation; the list is intentionally driven by the final source rather than pre-frozen.

## UI and interaction

`TopoCanvas.tsx`:

- `view: "3d" | "2d"` local state, default `"3d"`.
- Toggle button positioned top-right of the canvas container (styled consistently with existing lab pages; reuses `components/Button` if suitable).
- Single `<ThreeCanvas>` with `className="grid-full"`, `style={{ backgroundColor: "#f5f5f5", height: "40rem" }}`, no `EffectComposer`, no `Bloom`/`Noise`.
- Conditionally renders `<TerrainMesh />` or `<HeightmapQuad />` based on `view`.
- 3D branch mounts `<OrbitControls enablePan={false} enableZoom={true} />` with a perspective camera at roughly `[1.2, 1.2, 1.2]`, fov ~35, looking at origin.
- 2D branch uses an orthographic camera sized to the fullscreen quad.
- Renders `<LabMenu title="Topo" description="..." />` above the canvas, matching existing lab pages.

The page-level MDX is minimal — title, short intro paragraph, `<Canvas />` — and inherits the site's MDX layout.

## Mesh, camera & performance

- **Plane geometry:** `PlaneGeometry(2, 2, 256, 256)`. ~66k vertices — adequate for the filter's detail, comfortable on modern GPUs.
- **Orientation:** plane initially in XY; rotated so displacement points up (+Y in world). Final choice of UV convention resolved against the Shadertoy's coordinate system during implementation so uv = (0..1) maps consistently to both views.
- **2D quad:** fullscreen triangle or `PlaneGeometry(2, 2)` paired with `OrthographicCamera`.
- **Performance budget:** ~66k vertices × up to ~6 octaves per vertex. If profiling during implementation shows frame drops, fallback knobs in priority order:
  1. reduce segments to 192²,
  2. cap Leva max octaves at 5,
  3. switch to approach B (render-to-texture into an `RGBA32F` target, sampled by both views).

## Verification

No automated tests. Verification is visual and manual:

1. `bun dev`, navigate to `/lab/topo`.
2. Confirm both 3D and 2D views render.
3. Confirm toggle switches between them without remounting the canvas in a way that loses camera state.
4. Confirm every Leva slider visibly changes the output in both views.
5. Confirm orbit controls work in 3D.
6. Confirm the page looks coherent with the rest of the lab section (typography, spacing, menu).

## Out-of-scope / deferred

- RTT-backed implementation (approach B).
- Ridge-map output / dendritic drainage visualization.
- Colormap options in 2D view beyond grayscale.
- Heightmap export / screenshot button.
- Mobile/touch tuning beyond what ThreeCanvas provides by default.
