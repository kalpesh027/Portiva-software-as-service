import React from 'react';

const Projects = ({ projects }) => {
  return (
    <section>
      <h2>Projects</h2>
      {projects.map((project, index) => (
        <div key={index}>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <p>Technologies: {project.technologies.join(', ')}</p>
        </div>
      ))}
    </section>
  );
};

export default Projects;
