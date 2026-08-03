import type { StaticImageData } from "next/image";
import { FC } from "react";

import leafMapPreview from "../../app/projects/leaf-map/hero.png";
import muserPreview from "../../app/projects/muser/hero.png";
import simplyPreview from "../../app/projects/simply/hero.jpg";
import spacetopPreview from "../../app/projects/spacetop/hero.jpg";
import widgetsPreview from "../../app/projects/widgets/screenshot.png";
import LeafMapIcon from "./icons/leaf-map.svg";
import MuserIcon from "./icons/muser.svg";
import SimplyIcon from "./icons/simply.svg";
import SpacetopIcon from "./icons/spacetop.svg";
import WidgetsIcon from "./icons/widgets.svg";

type ProjectItem = {
  slug: string;
  name: string;
  subtitle: string;
  icon: FC;
  preview: StaticImageData;
  link?: string;
  year: number;
};

const projects: ProjectItem[] = [
  {
    slug: "spacetop",
    name: "Spacetop",
    subtitle: "Augmented reality laptop OS",
    icon: SpacetopIcon as FC,
    preview: spacetopPreview,
    year: 2025
  },
  {
    slug: "simply",
    name: "Simply Piano XR",
    subtitle: "Spatial piano learning app",
    icon: SimplyIcon as FC,
    preview: simplyPreview,
    year: 2025
  },
  {
    slug: "muser",
    name: "Muser",
    subtitle: "Smart music visualizer",
    icon: MuserIcon as FC,
    preview: muserPreview,
    link: "https://jonshamir.github.io/muser/",
    year: 2021
  },
  {
    slug: "widgets",
    name: "Widgets Bar",
    subtitle: "Extension toolbar for Apple Safari",
    icon: WidgetsIcon as FC,
    preview: widgetsPreview,
    year: 2016
  },
  {
    slug: "leaf-map",
    name: "Leaf Map",
    subtitle: "Interactive map of leaf shapes",
    icon: LeafMapIcon as FC,
    preview: leafMapPreview,
    link: "https://jonshamir.github.io/leaf-map/",
    year: 2018
  }
];

export default projects;
