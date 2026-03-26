import { Container, Row, Col, Card } from 'react-bootstrap'
import { ImPointRight } from 'react-icons/im'
import Tilt from 'react-parallax-tilt'
import { getSafe, getEducation, getExperience, getSkills, getAvatarUrl } from '../../_base/placeholder_helpers'
import IconBadgeGrid from '../components/IconBadgeGrid'
import GithubActivity from '../components/GithubActivity'
import Particle from '../components/Particle'
import { getInterestList, getToolList } from '../utils/portfolioData'

export default function About({ portfolio }) {
  const avatar = getAvatarUrl(portfolio)
  const education = getEducation(portfolio)
  const experience = getExperience(portfolio)
  const currentRole = experience[0]?.role || getSafe(portfolio, 'title', 'Developer')
  const currentCompany = experience[0]?.company || 'an awesome team'
  const primaryEducation = education[0]
  const activities = getInterestList(portfolio)
  const tools = getToolList(portfolio)

  return (
    <>
      <Particle />
      <Container fluid className="about-section">
        <Container>
          <Row style={{ justifyContent: 'center', padding: '10px' }}>
            <Col md={7} style={{ justifyContent: 'center', paddingTop: '30px', paddingBottom: '50px' }}>
              <h1 style={{ fontSize: '2.1em', paddingBottom: '20px' }}>
                Know Who <strong className="purple">I'M</strong>
              </h1>
              <Card className="quote-card-view">
                <Card.Body>
                  <blockquote className="blockquote mb-0">
                    <p style={{ textAlign: 'justify' }}>
                      Hi everyone! I'm <span className="purple">{getSafe(portfolio, 'name', 'Portfolio Owner')}</span>{' '}
                      from <span className="purple">{getSafe(portfolio, 'location', 'your city')}</span>.
                      <br />
                      I'm currently working as a <span className="purple">{currentRole}</span> at{' '}
                      <span className="purple">{currentCompany}</span>.
                      {primaryEducation && (
                        <>
                          <br />I hold {primaryEducation.degree ? <span className="purple">{primaryEducation.degree}</span> : 'a degree'}
                          {primaryEducation.institution ? <> from <span className="purple">{primaryEducation.institution}</span></> : null}.
                        </>
                      )}
                      <br />
                      <br />
                      Outside of coding, I love engaging in activities that keep me creative and inspired:
                    </p>

                    <ul>
                      {activities.map((activity) => (
                        <li className="about-activity" key={activity}>
                          <ImPointRight /> {activity}
                        </li>
                      ))}
                    </ul>

                    {portfolio?.personal_quote && (
                      <p style={{ color: 'rgb(155 126 172)' }}>
                        "{portfolio.personal_quote}"
                      </p>
                    )}
                    <footer className="blockquote-footer">{getSafe(portfolio, 'name', 'Portfolio Owner')}</footer>
                  </blockquote>
                </Card.Body>
              </Card>
            </Col>
            <Col md={5} style={{ paddingTop: '120px', paddingBottom: '50px' }} className="about-img">
              <Tilt>
                <img 
                  src={avatar} 
                  alt="about" 
                  className="img-fluid"
                  onError={(e) => {
                    e.currentTarget.src = '/default-avatar.png'
                  }}
                />
              </Tilt>
            </Col>
          </Row>
          <h1 className="project-heading">
            Professional <strong className="purple">Skillset </strong>
          </h1>

          <IconBadgeGrid items={getSkills(portfolio)} />

          <h1 className="project-heading">
            <strong className="purple">Tools</strong> I use
          </h1>

          <IconBadgeGrid items={tools} />

          <GithubActivity portfolio={portfolio} />
        </Container>
      </Container>
    </>
  )
}
