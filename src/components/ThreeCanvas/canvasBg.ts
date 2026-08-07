/* Backdrop for the WebGL lab canvases — deliberately theme-independent.
   A TS constant rather than a CSS custom property because WebGL can't read CSS:
   the same value has to reach both the wrapper's background and, on canvases
   that clear to it, the r3f `<color attach="background">`.
   Lives in its own r3f-free module so server components (e.g. the homepage
   grid's data) can import it without pulling @react-three/fiber in. */
export const CANVAS_BG = "#101010";
