import { PLANT_BG } from "../../../app/lab/plant/plantBg";
import { CANVAS_BG } from "../../../components/ThreeCanvas/canvasBg";

export type CanvasSceneId = "sdf-collision" | "craters" | "plant";

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
  | (BaseItem & {
      kind: "canvas";
      scene: CanvasSceneId;
      canvasBg?: string;
    });

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
    canvasBg: CANVAS_BG,
    caption: "Moon crater mapping",
    span: 2,
    aspectRatio: "1 / 1",
    href: "/lab/craters"
  },
  {
    id: "plant",
    kind: "canvas",
    scene: "plant",
    canvasBg: PLANT_BG,
    caption: "Procedural plant",
    span: 2,
    aspectRatio: "3 / 4",
    href: "/lab/plant"
  },
  {
    id: "sdf-collision",
    kind: "video",
    src: "/homepage/sdf-collision.mp4",
    caption: "SDF shape collisions",
    span: 2,
    aspectRatio: "3 / 4",
    href: "/lab/sdf-collision"
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
    id: "uirect",
    kind: "image",
    src: "/homepage/uirect.webp",
    alt: "UIRect poster of rounded rectangles morphing into circles",
    caption: "UIRect poster",
    span: 2,
    aspectRatio: "2480 / 3508"
  },
  {
    id: "hex",
    kind: "image",
    src: "/homepage/hex.webp",
    alt: "Risograph print of interlocking knotted lines",
    caption: "Riso print",
    span: 1,
    aspectRatio: "1440 / 1594"
  }
];
