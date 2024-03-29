import React from "react";
import { Link } from "react-router-dom";
import projectData from "../../projects/projectData.js";

import Image from "../../components/Image/Image";

import "./ProjectSection.scss";

const ProjectSection = (props) => {
  return (
    <div className="ProjectSection section">
      <h2>Projects</h2>
      <div className="projectTiles">
        {projectData.map((project) => (
          <Link
            to={`/projects/${project.slug}`}
            className="ProjectTile"
            key={project.slug}
          >
            <Image
              src={`assets/projects/${project.slug}/cover.jpg`}
              alt={project.name}
              style={{ backgroundColor: project.color }}
            />
            <div className="info">
              <h3>{project.name}</h3>
              <span>{project.subtitle}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProjectSection;
