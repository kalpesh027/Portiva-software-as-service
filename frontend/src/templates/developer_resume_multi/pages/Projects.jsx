import { Container, Row, Col } from 'react-bootstrap'
import ProjectCard from '../components/ProjectCard'
import Particle from '../components/Particle'
import { getEnhancedProjects } from '../utils/portfolioData'

export default function Projects({ portfolio }) {
  const projects = getEnhancedProjects(portfolio)

  return (
    <Container fluid className="project-section">
      <Particle />
      <Container>
        <h1 className="project-heading">
          My Recent <strong className="purple">Works </strong>
        </h1>
        <p style={{ color: 'white' }}>
          Here are a few projects I've worked on recently.
        </p>
        <Row style={{ justifyContent: 'center', paddingBottom: '10px' }}>
          {projects.map((project) => (
            <Col md={4} className="project-card" key={project._index}>
              <ProjectCard project={project} />
            </Col>
          ))}
        </Row>
      </Container>
    </Container>
  )
}
