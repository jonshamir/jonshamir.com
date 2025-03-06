type ProjectItem = {
  slug: string;
  name: string;
  subtitle: string;
  link?: string;
};

const projects: ProjectItem[] = [
  {
    slug: "spacetop",
    name: "Spacetop",
    subtitle: "2025 · Augmented reality laptop"
  },
  {
    slug: "herb-tree",
    name: "Herb Tree",
    subtitle: "2023 · Interactive botanic visualization"
  },
  {
    slug: "muser",
    name: "Muser",
    subtitle: "2021 · Smart music visualizer",
    link: "https://jonshamir.github.io/muser/"
  },
  // {
  //   slug: "unity-cg",
  //   name: "Unity CG",
  //   subtitle: "2020-2023 · Computer graphics course in Unity",
  // },
  {
    slug: "leaf-map",
    name: "Leaf Map",
    subtitle: "2018 · Interactive map of leaf shapes",
    link: "https://jonshamir.github.io/leaf-map/"
  },
  {
    slug: "widgets-bar",
    name: "Widgets Bar",
    subtitle: "2015 · Extension toolbar for Apple Safari"
  }
];

export default projects;
