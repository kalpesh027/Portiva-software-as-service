import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import { CgWebsite } from 'react-icons/cg'
import { BsGithub } from 'react-icons/bs'
import { useState } from 'react'

export default function ProjectCard({ project }) {
  const [imageSrc, setImageSrc] = useState(project.image_url)

  const handleImageError = () => {
    // Fallback to a solid color background with text
    setImageSrc(`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect fill='%236366f1' width='600' height='400'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='white' text-anchor='middle' dominant-baseline='middle' font-family='sans-serif'%3E${encodeURIComponent(project.name || 'Project')}%3C/text%3E%3C/svg%3E`)
  }

  return (
    <Card className="project-card-view">
      <Card.Img 
        variant="top" 
        src={imageSrc} 
        alt={project.name || 'project image'}
        onError={handleImageError}
      />
      <Card.Body>
        <Card.Title>{project.name}</Card.Title>
        <Card.Text style={{ textAlign: 'justify' }}>{project.description}</Card.Text>
        {project.github_url && (
          <Button variant="primary" href={project.github_url} target="_blank" rel="noreferrer">
            <BsGithub /> &nbsp;
            {project.is_blog ? 'Blog' : 'GitHub'}
          </Button>
        )}
        {!project.is_blog && project.live_url && (
          <Button
            variant="primary"
            href={project.live_url}
            target="_blank"
            rel="noreferrer"
            style={{ marginLeft: '10px' }}
          >
            <CgWebsite /> &nbsp;Demo
          </Button>
        )}
      </Card.Body>
    </Card>
  )
}
