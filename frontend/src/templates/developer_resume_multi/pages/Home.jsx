import { Container, Row, Col } from 'react-bootstrap'
import Tilt from 'react-parallax-tilt'
import { AiFillGithub, AiOutlineTwitter, AiFillInstagram } from 'react-icons/ai'
import { FaLinkedinIn } from 'react-icons/fa'
import { getSafe, getSkills, getAvatarUrl } from '../../_base/placeholder_helpers'
import TypeRotator from '../components/TypeRotator'
import Particle from '../components/Particle'

export default function Home({ portfolio }) {
  const featuredSkills = getSkills(portfolio).slice(0, 5)
  const imageSrc = getAvatarUrl(portfolio)
  const longBio = getSafe(portfolio, 'about_extended', getSafe(portfolio, 'about'))

  return (
    <section>
      <Container fluid className="home-section" id="home">
        <Particle />
        <Container className="home-content">
          <Row>
            <Col md={7} className="home-header">
              <h1 style={{ paddingBottom: 15 }} className="heading">
                Hi There!{' '}
                <span className="wave" role="img" aria-labelledby="wave">
                  👋🏻
                </span>
              </h1>

              <h1 className="heading-name">
                I'M
                <strong className="main-name"> {getSafe(portfolio, 'name', 'Portfolio Owner')}</strong>
              </h1>

              <div style={{ padding: 50, textAlign: 'left' }}>
                <TypeRotator portfolio={portfolio} />
              </div>
            </Col>

            <Col md={5} style={{ paddingBottom: 20 }}>
              <img src={imageSrc} alt="home pic" className="img-fluid" style={{ maxHeight: '450px' }} />
            </Col>
          </Row>
        </Container>
      </Container>

      <Container fluid className="home-about-section" id="about">
        <Container>
          <Row>
            <Col md={8} className="home-about-description">
              <h1 style={{ fontSize: '2.6em' }}>
                LET ME <span className="purple"> INTRODUCE </span> MYSELF
              </h1>
              <p className="home-about-body">
                {longBio}
                <br />
                <br />
                {featuredSkills.length > 0 && (
                  <>
                    I love building with
                    <i>
                      <b className="purple"> {featuredSkills.join(', ')} </b>
                    </i>
                    and modern developer tooling.
                  </>
                )}
              </p>
            </Col>
            <Col md={4} className="myAvtar">
              <Tilt>
                <img src={imageSrc} className="img-fluid" alt="avatar" />
              </Tilt>
            </Col>
          </Row>
        </Container>
      </Container>

      <Container>
        <Row style={{ paddingTop: '50px', paddingBottom: '80px' }}>
          <Col md={12} className="home-about-social">
            <h1>Find Me On</h1>
            <p>
              Feel free to <span className="purple">connect </span>with me
            </p>
            <ul className="home-about-social-links">
              {portfolio?.contact_github && (
                <li className="social-icons">
                  <a href={portfolio.contact_github} target="_blank" rel="noreferrer" className="icon-colour home-social-icons">
                    <AiFillGithub />
                  </a>
                </li>
              )}
              {portfolio?.contact_twitter && (
                <li className="social-icons">
                  <a href={portfolio.contact_twitter} target="_blank" rel="noreferrer" className="icon-colour home-social-icons">
                    <AiOutlineTwitter />
                  </a>
                </li>
              )}
              {portfolio?.contact_linkedin && (
                <li className="social-icons">
                  <a href={portfolio.contact_linkedin} target="_blank" rel="noreferrer" className="icon-colour home-social-icons">
                    <FaLinkedinIn />
                  </a>
                </li>
              )}
              {portfolio?.contact_instagram && (
                <li className="social-icons">
                  <a href={portfolio.contact_instagram} target="_blank" rel="noreferrer" className="icon-colour home-social-icons">
                    <AiFillInstagram />
                  </a>
                </li>
              )}
            </ul>
          </Col>
        </Row>
      </Container>
    </section>
  )
}
