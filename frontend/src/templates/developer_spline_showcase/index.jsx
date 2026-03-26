import { motion } from 'framer-motion'
import {
  getSafe,
  getSkills,
  getExperience,
  getProjects,
  getEducation,
  getTestimonials,
  getBlogs,
  getAvatarUrl,
  getEnrichedProjects,
} from '../_base/placeholder_helpers'
import './index.css'

const serviceIcons = ['💻', '🎨', '🚀', '📈', '🧩', '🛠️']

export default function DeveloperSplineShowcase({ portfolio }) {
  const skills = getSkills(portfolio)
  const projects = getEnrichedProjects(portfolio)
  const experience = getExperience(portfolio)
  const education = getEducation(portfolio)
  const testimonials = getTestimonials(portfolio)
  const blogs = getBlogs(portfolio)
  const avatarUrl = getAvatarUrl(portfolio)

  const heroName = getSafe(portfolio, 'name', 'Portfolio Owner')
  const heroTitle = getSafe(portfolio, 'title', 'Full Stack Developer')
  const heroAbout = getSafe(portfolio, 'about', 'I build modern, reliable digital products.')
  const aboutExtended = getSafe(portfolio, 'about_extended', heroAbout)

  const primaryCta = getSafe(portfolio, 'cta_primary', 'Get in touch')
  const secondaryCta = getSafe(portfolio, 'cta_secondary', 'Learn more')

  const email = getSafe(portfolio, 'contact_email', '')
  const linkedin = getSafe(portfolio, 'contact_linkedin', '')
  const github = getSafe(portfolio, 'contact_github', '')
  const twitter = getSafe(portfolio, 'contact_twitter', '')

  const yearsExperience = getSafe(portfolio, 'years_experience', experience.length > 0 ? String(experience.length) : '1')
  const totalSkills = skills.length > 0 ? skills.length : 1
  const totalProjects = projects.length > 0 ? projects.length : getProjects(portfolio).length

  const topSkills = skills.slice(0, 6)
  const serviceItems = topSkills.length > 0 ? topSkills : ['Frontend Development', 'Backend Development', 'Performance Optimization']

  return (
    <div className="tpl-spline">
      <div className="tpl-spline-shell">
        <nav className="tpl-spline-nav">
          <div className="tpl-spline-brand">{heroName.split(' ')[0] || 'Portfolio'}</div>
          <div className="tpl-spline-links">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
            <a href="#services">Services</a>
            <a href="#contact">Contact</a>
          </div>
        </nav>

        <section id="home" className="tpl-spline-section tpl-spline-hero">
          <div>
            <div className="tpl-spline-pill-row">
              {topSkills.slice(0, 3).map((skill, idx) => (
                <span key={`${skill}-${idx}`} className="tpl-spline-pill">{skill}</span>
              ))}
            </div>
            <h1>
              Hello, I&apos;m <span className="tpl-spline-gradient">{heroName}</span>
            </h1>
            <p className="tpl-spline-sub">{heroTitle}</p>
            <p className="tpl-spline-sub">{heroAbout}</p>
            <div className="tpl-spline-ctas">
              {email && (
                <a className="tpl-spline-btn tpl-spline-btn-primary" href={`mailto:${email}`}>
                  {primaryCta}
                </a>
              )}
              <a className="tpl-spline-btn tpl-spline-btn-secondary" href="#about">
                {secondaryCta}
              </a>
            </div>
          </div>
          <motion.div
            className="tpl-spline-hero-media"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <img src={avatarUrl || '/default-avatar.png'} alt={heroName} />
          </motion.div>
        </section>

        <section id="about" className="tpl-spline-section">
          <h2 className="tpl-spline-title">About</h2>
          <p className="tpl-spline-sub">{aboutExtended}</p>
          <div className="tpl-spline-card-grid" style={{ marginTop: 18 }}>
            <div className="tpl-spline-card">
              <h3>{yearsExperience}+</h3>
              <p>Years of experience</p>
            </div>
            <div className="tpl-spline-card">
              <h3>{totalSkills}+</h3>
              <p>Technologies mastered</p>
            </div>
            <div className="tpl-spline-card">
              <h3>{totalProjects}+</h3>
              <p>Projects delivered</p>
            </div>
          </div>
        </section>

        <section id="projects" className="tpl-spline-section">
          <h2 className="tpl-spline-title">Projects</h2>
          <p className="tpl-spline-sub">Highlighted work and shipped products.</p>
          <div className="tpl-spline-project-grid" style={{ marginTop: 18 }}>
            {projects.map((project) => (
              <motion.article
                key={project._index}
                className="tpl-spline-card"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="tpl-spline-project-media">
                  <img src={project.image_url || '/default-project.png'} alt={project.name || 'Project'} />
                </div>
                <h3>{project.name || 'Untitled Project'}</h3>
                <p>{project.description || 'Project description coming soon.'}</p>
                {project.tech && <p className="tpl-spline-sub">Tech: {project.tech}</p>}
                <div className="tpl-spline-actions">
                  {project.live_url && <a href={project.live_url} target="_blank" rel="noreferrer">Live</a>}
                  {project.github_url && <a href={project.github_url} target="_blank" rel="noreferrer">GitHub</a>}
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="services" className="tpl-spline-section">
          <h2 className="tpl-spline-title">Services</h2>
          <p className="tpl-spline-sub">Core capabilities from my skillset.</p>
          <div className="tpl-spline-service-grid" style={{ marginTop: 18 }}>
            {serviceItems.map((service, idx) => (
              <div key={`${service}-${idx}`} className="tpl-spline-card">
                <div style={{ fontSize: 20 }}>{serviceIcons[idx % serviceIcons.length]}</div>
                <h3 style={{ margin: '6px 0' }}>{service}</h3>
                <p className="tpl-spline-sub">Practical delivery focused on maintainability, performance, and business outcomes.</p>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="tpl-spline-section">
          <div className="tpl-spline-contact">
            <h2 className="tpl-spline-title">{getSafe(portfolio, 'hero_headline', 'Let\'s work together.')}</h2>
            <p>{getSafe(portfolio, 'tagline', 'Open to freelance and full-time opportunities.')}</p>
            <div className="tpl-spline-ctas" style={{ justifyContent: 'center' }}>
              {email && (
                <a className="tpl-spline-btn tpl-spline-btn-primary" href={`mailto:${email}`}>
                  {primaryCta}
                </a>
              )}
              {linkedin && (
                <a className="tpl-spline-btn tpl-spline-btn-secondary" href={linkedin} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              )}
              {github && (
                <a className="tpl-spline-btn tpl-spline-btn-secondary" href={github} target="_blank" rel="noreferrer">
                  GitHub
                </a>
              )}
              {twitter && (
                <a className="tpl-spline-btn tpl-spline-btn-secondary" href={twitter} target="_blank" rel="noreferrer">
                  Twitter
                </a>
              )}
            </div>
            {(education.length > 0 || testimonials.length > 0 || blogs.length > 0) && (
              <p style={{ marginTop: 14 }}>
                Extras: {education.length} education, {testimonials.length} testimonials, {blogs.length} blog items.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
