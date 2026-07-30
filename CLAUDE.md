# Claude Context

## Package Management

- Use `bun` instead of `npm` for package installation and management

## Styling

**Global CSS + CSS Modules hybrid**, deliberately: most content (MDX posts, project
pages) is bare semantic HTML with no component to hang a scoped class on, so global
element selectors are the only thing that can style it.

- **Global** (`src/styles/`) — reset, tokens, prose typography, layout primitives
  (`.grid`, `.flow`, `.grid-wide`, `.cover`), code blocks, shared keyframes, `.fade-in`.
  Anything that must reach MDX output or is shared by unrelated components.
- **Module** (`*.module.css` beside the component) — everything else, and the default.
  Only `.module.css`: no Sass, no plain colocated `.css` outside the two exceptions.

Rules of thumb:

- Use tokens for colours, radii, easings, durations and z-index (scales in `main.css`).
  Breakpoints must be literals — custom properties don't work in `@media` — and are
  listed at the top of `layout.css`.
- Tokenise spacing that lands on `--space-*` (0.25/0.5/1/1.5/2/3rem). Leave *optical*
  values (0.2/0.3/0.35/0.4/0.6/0.8rem) and *positional* offsets (`LabMenu`'s
  `padding-left`) literal — snapping them would change the design.
- Write broadly-matching global rules with `:where()`, so a component can override them
  with a plain class instead of `!important`. The stack in `layout.css` and the form
  styles in `typography.css` do this deliberately — don't "fix" them back to `:is()`.

Two exceptions to modules-by-default, both commented in place: `three-canvas.css`
(module hashes desync from the injected stylesheet during Fast Refresh) and
`TilePrototype.css` (`interactions.js` queries elements by literal class name).

**Cascade gotcha: ties aren't decided by anything visible in the source.** The global
sheet is emitted after the module chunks in the SSR'd `<link>` set, so page-shipped
modules *lose* ties. But client-only and lazily-loaded module CSS isn't in that set —
React injects it at runtime, after the global sheet, so it *wins*. Which bucket a
component lands in is a chunking artifact. Win by specificity, never by order: this is
why dropping an `!important` can keep working locally and still be wrong (see
`FocusControl`, scoped to `.FocusControl .slider` to beat the global form styles).

Cascade layers would fix that structurally but aren't applied: `:where()` covers what
actually bites, without changing how KaTeX's and Shiki's `!important` rules resolve.

**Vertical rhythm** belongs to the stack (`:where(.grid, .flow) > * + *`) — set
`--space` on a child rather than a `margin-block`. The two stack rules are split by
intent, explained in place in `layout.css`: bottom margins are an `!important`
invariant, so a stray one is inert rather than doubling the gap; top margins are an
overridable default, so a stray one works but sits outside the `--space` vocabulary.

**The stack only reaches direct children**, and fails silently — a wrapper stops rhythm
dead for everything inside it:

```jsx
<div className="grid">
  <p>spaced</p>
  <div>                {/* ← rhythm stops here */}
    <p>not spaced</p>
  </div>
</div>
```

Add `flow` to the wrapper (`.flow` is *only* the stack — no layout of its own, safe
anywhere), as every nested `<section>`/`<article>` in `elements/page.tsx` does. Better,
drop the wrapper: in a `.grid`, children are already placed by `grid-column`.
