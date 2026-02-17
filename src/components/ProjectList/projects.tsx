import { FC } from "react";

import LeafMapIcon from "./icons/leaf-map.svg";
import MuserIcon from "./icons/muser.svg";
import SpacetopIcon from "./icons/spacetop.svg";
import WidgetsIcon from "./icons/widgets.svg";

type ProjectItem = {
  slug: string;
  name: string;
  subtitle: string;
  icon: FC;
  link?: string;
  year: number;
};

const projects: ProjectItem[] = [
  {
    slug: "spacetop",
    name: "Spacetop",
    subtitle: "Augmented reality laptop OS",
    icon: SpacetopIcon as FC,
    year: 2025
  },
  {
    slug: "muser",
    name: "Muser",
    subtitle: "Smart music visualizer",
    icon: MuserIcon as FC,
    link: "https://jonshamir.github.io/muser/",
    year: 2021
  },
  {
    slug: "widgets",
    name: "Widgets Bar",
    subtitle: "Extension toolbar for Apple Safari",
    icon: WidgetsIcon as FC,
    year: 2016
  },
  {
    slug: "leaf-map",
    name: "Leaf Map",
    subtitle: "Interactive map of leaf shapes",
    icon: LeafMapIcon as FC,
    link: "https://jonshamir.github.io/leaf-map/",
    year: 2018
  }
];

export default projects;
