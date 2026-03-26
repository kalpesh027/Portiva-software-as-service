import { Container, Row, Col } from 'react-bootstrap'
import { AiFillGithub, AiOutlineTwitter, AiFillInstagram } from 'react-icons/ai'
import { FaLinkedinIn } from 'react-icons/fa'
import { getSafe } from '../../_base/placeholder_helpers'

export default function TemplateFooter({ portfolio }) {
  const year = new Date().getFullYear()
  const name = getSafe(portfolio, 'name', 'Portfolio Owner')

  return (
    <Container fluid className="footer">
      <Row>
        <Col md="4" className="footer-copywright">
          <h3>Designed and Developed by {name}</h3>
        </Col>
        <Col md="4" className="footer-copywright">
          <h3>Copyright © {year} {name}</h3>
        </Col>
        <Col md="4" className="footer-body">
          <ul className="footer-icons">
            {portfolio?.contact_github && (
              <li className="social-icons">
                <a href={portfolio.contact_github} style={{ color: 'white' }} target="_blank" rel="noopener noreferrer">
                  <AiFillGithub />
                </a>
              </li>
            )}
            {portfolio?.contact_twitter && (
              <li className="social-icons">
                <a href={portfolio.contact_twitter} style={{ color: 'white' }} target="_blank" rel="noopener noreferrer">
                  <AiOutlineTwitter />
                </a>
              </li>
            )}
            {portfolio?.contact_linkedin && (
              <li className="social-icons">
                <a href={portfolio.contact_linkedin} style={{ color: 'white' }} target="_blank" rel="noopener noreferrer">
                  <FaLinkedinIn />
                </a>
              </li>
            )}
            {portfolio?.contact_instagram && (
              <li className="social-icons">
                <a href={portfolio.contact_instagram} style={{ color: 'white' }} target="_blank" rel="noopener noreferrer">
                  <AiFillInstagram />
                </a>
              </li>
            )}
          </ul>
        </Col>
      </Row>
    </Container>
  )
}
