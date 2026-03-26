import { useEffect, useState } from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import { Link } from 'react-router-dom'
import { CgGitFork, CgFileDocument } from 'react-icons/cg'
import { ImBlog } from 'react-icons/im'
import { AiFillStar, AiOutlineHome, AiOutlineFundProjectionScreen, AiOutlineUser } from 'react-icons/ai'
import { getBlogs, getAvatarUrl } from '../../_base/placeholder_helpers'

export default function TemplateNavbar({ portfolio }) {
  const [expand, updateExpanded] = useState(false)
  const [navColour, updateNavbar] = useState(false)
  const slug = window.location.pathname.replace(/^\//, '').split('/')[0]
  const blogs = getBlogs(portfolio)
  const blogHref = blogs[0]?.url || '#'
  const logoSrc = getAvatarUrl(portfolio)

  useEffect(() => {
    const scrollHandler = () => {
      updateNavbar(window.scrollY >= 20)
    }
    window.addEventListener('scroll', scrollHandler)
    return () => window.removeEventListener('scroll', scrollHandler)
  }, [])

  return (
    <Navbar expanded={expand} fixed="top" expand="md" className={navColour ? 'sticky' : 'navbar'}>
      <Container>
        <Navbar.Brand as={Link} to={`/${slug}`} className="d-flex">
          <img src={logoSrc} className="img-fluid logo" alt="brand" />
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="responsive-navbar-nav"
          onClick={() => {
            updateExpanded(expand ? false : 'expanded')
          }}
        >
          <span></span>
          <span></span>
          <span></span>
        </Navbar.Toggle>
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ms-auto" defaultActiveKey="#home">
            <Nav.Item>
              <Nav.Link as={Link} to={`/${slug}`} onClick={() => updateExpanded(false)}>
                <AiOutlineHome style={{ marginBottom: '2px' }} /> Home
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link as={Link} to={`/${slug}/about`} onClick={() => updateExpanded(false)}>
                <AiOutlineUser style={{ marginBottom: '2px' }} /> About
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link as={Link} to={`/${slug}/project`} onClick={() => updateExpanded(false)}>
                <AiOutlineFundProjectionScreen style={{ marginBottom: '2px' }} /> Projects
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link as={Link} to={`/${slug}/resume`} onClick={() => updateExpanded(false)}>
                <CgFileDocument style={{ marginBottom: '2px' }} /> Resume
              </Nav.Link>
            </Nav.Item>

            {blogHref !== '#' && (
              <Nav.Item>
                <Nav.Link href={blogHref} target="_blank" rel="noreferrer">
                  <ImBlog style={{ marginBottom: '2px' }} /> Blogs
                </Nav.Link>
              </Nav.Item>
            )}

            {portfolio?.contact_github && (
              <Nav.Item className="fork-btn">
                <Button href={portfolio.contact_github} target="_blank" className="fork-btn-inner">
                  <CgGitFork style={{ fontSize: '1.2em' }} /> <AiFillStar style={{ fontSize: '1.1em' }} />
                </Button>
              </Nav.Item>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
