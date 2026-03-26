import React from 'react'
import { 
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNodedotjs,
  SiPython,
  SiDocker,
  SiGit,
  SiMongodb,
  SiPostgresql,
  SiRedux
} from 'react-icons/si'

const iconMap = {
  'javascript': SiJavascript,
  'typescript': SiTypescript,
  'react': SiReact,
  'react.js': SiReact,
  'node.js': SiNodedotjs,
  'node': SiNodedotjs,
  'python': SiPython,
  'docker': SiDocker,
  'git': SiGit,
  'mongodb': SiMongodb,
  'mongo db': SiMongodb,
  'postgresql': SiPostgresql,
  'redux': SiRedux
}

const IconBadgeGrid = ({ skills = [] }) => {
  const renderSkillIcon = (skill) => {
    const normalizedSkill = skill.toLowerCase().trim()
    const IconComponent = iconMap[normalizedSkill]

    if (IconComponent) {
      return (
        <div
          key={skill}
          className="d-inline-flex align-items-center gap-2 bg-light rounded-pill px-3 py-2 m-1"
        >
          <IconComponent size={18} className="text-primary" />
          <span className="fw-medium small">{skill}</span>
        </div>
      )
    }

    // Fallback badge without icon
    return (
      <div
        key={skill}
        className="d-inline-flex align-items-center bg-light rounded-pill px-3 py-2 m-1"
      >
        <span className="fw-medium small">{skill}</span>
      </div>
    )
  }

  return (
    <div className="d-flex flex-wrap">
      {skills.map(renderSkillIcon)}
    </div>
  )
}

export default IconBadgeGrid