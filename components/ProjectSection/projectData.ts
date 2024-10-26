type Project = {
  slug: string;
  name: string;
  subtitle: string;
  color: string;
  link?: string;
};

const projectData: Project[] = [
  {
    slug: "herb-tree",
    name: "Herb Tree",
    subtitle: "2023 | Interactive botanic visualization",
    color: "#e7e1e1"
  },
  {
    slug: "muser",
    name: "Muser",
    subtitle: "2021 | Smart music visualizer",
    color: "#648887",
    link: "https://jonshamir.github.io/muser/"
  },
  {
    slug: "unity-cg",
    name: "Unity CG",
    subtitle: "2020-2023 | Computer graphics course in Unity",
    color: "#8595a8"
  },
  {
    slug: "scopus",
    name: "Scopus",
    subtitle: "2019 | Short 3D animation",
    color: "#a1a1a1"
  },
  {
    slug: "leaf-map",
    name: "Leaf Map",
    subtitle: "2018 | Interactive map of leaf shapes",
    color: "#f8f3ef",
    link: "https://jonshamir.github.io/leaf-map/"
  }
];

export default projectData;
