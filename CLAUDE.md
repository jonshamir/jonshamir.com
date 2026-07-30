# Claude Context

## Package Management

- Use `bun` instead of `npm` for package installation and management

## Styling

The site deliberately uses a **global CSS + CSS Modules hybrid**. This is not an
accident of history — most content (MDX posts, project pages) is authored as bare
semantic HTML with no component to hang a scoped class on, so global element
selectors are the only thing that can style it.

**Global** (`src/styles/`) — reset, design tokens, element-level prose typography,
layout primitives (`.grid`, `.flow`, `.grid-wide`, `.cover`), code-block styling,
shared keyframes and the `.fade-in` utility. Anything that must reach MDX output or
is shared by unrelated components.

**Module** (`*.module.css` beside the component) — everything else. This is the default.

Rules of thumb:

- Use tokens. Don't hardcode colours, radii, easings, durations, spacing, or z-index.
  The scales live in `src/styles/main.css`; breakpoints are documented at the top of
  `src/styles/layout.css` (they must be literals — custom properties don't work in
  `@media` conditions).
- One module convention: `.module.css`. No `.scss` (nothing needed Sass), and no plain
  colocated `.css` except where documented below.
- Keep global selectors at zero specificity with `:where()` when they target bare
  elements, so modules can override them with a plain class instead of `!important`.

Two deliberate exceptions, both commented in place:

- `src/styles/three-canvas.css` is global because CSS-module hashes desync from the
  injected stylesheet during Fast Refresh, dropping `position: fixed`.
- `src/app/projects/spacetop/TilePrototype/TilePrototype.css` is not a module because
  `interactions.js` creates elements imperatively and queries them by literal class name.

**Cascade gotcha:** the global stylesheet is linked *after* the CSS-module chunks, so
at equal specificity **global rules win over module rules** — the opposite of what most
setups do, and not something import order can change (webpack decides it). So:

- Never rely on source order. Win by specificity.
- Write implicit, broadly-matching global rules with `:where()` so they sit at zero
  specificity and a component can always override them. The stack in `layout.css` and
  the form styles in `typography.css` both do this deliberately — don't "fix" them
  back to `:is()` or bare selectors.

Cascade layers would make this structural rather than conventional, but aren't applied:
the `:where()` discipline covers the cases that actually bite, without changing how
KaTeX and Shiki's `!important` rules resolve.

**Vertical rhythm** belongs to the stack (`:where(.grid, .flow) > * + *`). To change
spacing around a stack child, set `--space` on it — don't add `margin-block`. Note that
`.grid` is a *grid* container, so sibling margins do **not** collapse there; a margin
plus the stack gap will add up.
