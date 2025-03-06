type ProjectItem = {
  slug: string;
  name: string;
  subtitle: string;
  link?: string;
  year: number;
};

const projects: ProjectItem[] = [
  {
    slug: "prepbook",
    name: "Prepbook",
    subtitle: "Clever recipe notebook",
    year: 2025
  },
  {
    slug: "spacetop",
    name: "Spacetop",
    subtitle: "Augmented reality laptop",
    year: 2025
  },
  // {
  //   slug: "herb-tree",
  //   name: "Herbarium",
  //   subtitle: "Interactive botanic visualization"
  //   year: 2023
  // },
  {
    slug: "muser",
    name: "Muser",
    subtitle: "Smart music visualizer",
    link: "https://jonshamir.github.io/muser/",
    year: 2021
  },
  // {
  //   slug: "unity-cg",
  //   name: "Unity CG",
  //   subtitle: "Computer graphics course in Unity",
  //   year: 2020
  // },
  {
    slug: "leaf-map",
    name: "Leaf Map",
    subtitle: "Interactive map of leaf shapes",
    link: "https://jonshamir.github.io/leaf-map/",
    year: 2018
  },
  {
    slug: "widgets",
    name: "Widgets Bar",
    subtitle: "Extension toolbar for Apple Safari",
    year: 2016
  }
];

export default projects;
