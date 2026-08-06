export type CanvasSceneId = "sdf-collision" | "craters";

type BaseItem = {
  id: string;
  caption: string;
  span: 1 | 2 | 3; // sixths of the grid width
  aspectRatio: string;
  href?: string;
};

export type ExperimentItem =
  | (BaseItem & { kind: "image"; src: string; alt: string })
  | (BaseItem & { kind: "video"; src: string })
  | (BaseItem & { kind: "canvas"; scene: CanvasSceneId; href?: never });

export const experiments: ExperimentItem[] = [
  {
    id: "cavorite",
    kind: "video",
    src: "/homepage/cavorite.mp4",
    caption: "Cavorite",
    span: 3,
    aspectRatio: "16 / 9"
  },
  {
    id: "topo",
    kind: "image",
    src: "/lab/topo.png",
    alt: "Topographic terrain with contour lines",
    caption: "Topographic terrain",
    span: 2,
    aspectRatio: "1 / 1",
    href: "/lab/topo"
  },
  {
    id: "craters",
    kind: "canvas",
    scene: "craters",
    caption: "Moon crater mapping",
    span: 2,
    aspectRatio: "1 / 1"
  },
  {
    id: "plant",
    kind: "image",
    src: "/lab/plant.png",
    alt: "Procedurally grown plant in a pot",
    caption: "Procedural plant",
    span: 2,
    aspectRatio: "1 / 1",
    href: "/lab/plant"
  },
  {
    id: "herbs",
    kind: "video",
    src: "/homepage/herbs.mp4",
    caption: "Herb tree",
    span: 3,
    aspectRatio: "1596 / 828"
  },
  {
    id: "point-cloud",
    kind: "image",
    src: "/lab/point-cloud.png",
    alt: "Gaussian splat point cloud scan",
    caption: "Gaussian splats",
    span: 2,
    aspectRatio: "1 / 1",
    href: "/lab/point-cloud"
  },
  {
    id: "window",
    kind: "image",
    src: "/lab/window.jpg",
    alt: "Desktop window picker prototype",
    caption: "Window picker",
    span: 1,
    aspectRatio: "1 / 1",
    href: "/lab/window"
  }
];
