export const INTRO_DELAY_MS = 750;
export const INTRO_DURATION_MS = 1500;

export type SpaceId = "world" | "work" | "canvas" | "user" | "head";

// Shown in the description slot at rest, so the line never sits empty.
export const DEFAULT_DESCRIPTION = "Select a UI Space to learn more about it";

export const SPACES: { id: SpaceId; name: string; description: string }[] = [
  {
    id: "world",
    name: "World Space",
    description:
      "World Space is the global coordinate system. Content placed here stays fixed relative to the real environment."
  },
  {
    id: "work",
    name: "Work Space",
    description:
      'Work Space is the user\'s "setup", anchored by the user (or by hardware tracking). It positions the Canvas and holds 3D objects and UI within comfortable reach, like the Home Bar.'
  },
  {
    id: "canvas",
    name: "Canvas Space",
    description:
      "Canvas Space is a curved surface at the optimal viewing distance (1.5–2 m) where main content lives."
  },
  {
    id: "user",
    name: "User Space",
    description:
      "User Space follows the user's yaw with damping, stays parallel to the ground, and snaps to the Canvas. Home to the launcher, system dialogs and notifications: present and persistent, but not blocking."
  },
  {
    id: "head",
    name: "Head Space",
    description:
      "Head Space is a HUD that follows the user's head. Highly distracting by design, so reserved for small, non-interactive indicators."
  }
];

// Canonical id list and order. SpacesCanvas iterates this to drive animations,
// so it stays derived from SPACES rather than restated.
export const SPACE_IDS: SpaceId[] = SPACES.map((s) => s.id);
