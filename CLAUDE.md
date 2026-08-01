# Claude Context

## Package Management

- Use `bun` instead of `npm` for package installation and management

## Dev server

`next dev` and `next build` share the same `.next` directory, and a build replaces it.
Running `bun run build` while `next dev` is up wipes the dev server's compiled output:
it keeps serving HTML that points at dev-only URLs
(`_next/static/chunks/main-app.js`, `_next/static/css/app/layout.css`, all with a `?v=`
cache-buster) which no longer exist, so **every** asset 404s — JS as well as CSS. It
presents as "the CSS broke after my change"; it isn't related to the change at all.

Verify against the running dev server instead. `tsc` and `eslint` catch what a build
would surface locally, neither writes to `.next`, and CI builds on push:

    bunx tsc --noEmit && bun run lint      # types + lint
    # then check the change at localhost:3000

If it has already happened: stop the dev server, `rm -rf .next`, start it again, and
hard-reload the browser so it drops the stale HTML.

## Styling

**Global CSS + CSS Modules hybrid**, deliberately: MDX posts and project pages are bare
semantic HTML with no component to hang a scoped class on, so global element selectors
are the only thing that can style them.

- **Global** (`src/styles/`) — reset, tokens, prose typography, layout primitives
  (`.grid`, `.flow`, `.cover`), `.fade-in`. Anything that must reach MDX output or is
  shared by unrelated components.
- **Module** (`*.module.css`, beside the component) — everything else, and the default.
  Exactly two sanctioned non-module exceptions, both commented in place:
  `three-canvas.css` and `TilePrototype.css` — don't add a third.

Rules of thumb:

- Tokens for colours, radii, easings, durations, z-index and spacing (scales in
  `main.css`). Breakpoints stay literals — custom properties don't work in `@media`.
- `--space-*` is a `rem` scale. `em` is a separate category and never on it: it's
  font-relative on purpose (`Button`'s padding). Positional offsets that align to
  another element (`LabMenu`'s `padding-left`) also stay literal.
- `:root` sets `font-size: 1.1rem`, so `1rem` is 17.6px on desktop and 16px below 40rem.
  Never convert px to rem assuming a 16px root. Derive with `calc()` from an existing
  token rather than hardcoding today's equivalent.
- Write broadly-matching global rules with `:where()` so a component can override them
  with a plain class instead of `!important` — don't "fix" them back to `:is()`.

**Cascade gotcha: ties aren't decided by anything visible in the source.** The global
sheet is emitted after the module chunks in the SSR'd `<link>` set, so page-shipped
modules *lose* ties — but client-only and lazily-loaded module CSS is injected at
runtime, after it, so it *wins*. Which bucket a component lands in is a chunking
artifact. Win by specificity, never by order: this is why dropping an `!important` can
keep working locally and still be wrong (see `.FocusControl .slider`).

**Vertical rhythm** belongs to the stack (`:where(.grid, .flow) > * + *`) — set `--space`
on a child, never a `margin-block`. It reaches *direct* children only and fails silently,
so a wrapper stops rhythm dead for everything inside it. Add `flow` to the wrapper
(`.flow` is only the stack — no layout of its own, safe anywhere), or better, drop the
wrapper: in a `.grid`, children are already placed by `grid-column`.
