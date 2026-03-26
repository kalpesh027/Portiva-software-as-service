import { getSafe, getSkills, getProjects, getTestimonials, getList, getAvatarUrl, getEnrichedProjects } from '../_base/placeholder_helpers'

const getServices = (p) =>
  getList(p, 'service', ['name', 'description', 'price'], 'service_count')

/**
 * Freelancer Cards — single-page template.
 * Service cards + testimonials for freelancers and consultants.
 * Replace this stub with real JSX when ready.
 */
export default function FreelancerCards({ portfolio: p }) {
  const skills = getSkills(p)
  const projects = getEnrichedProjects(p)
  const testimonials = getTestimonials(p)
  const services = getServices(p)

  return (
    <div className="tpl-freelancer-cards">
      {/* Hero */}
      <section className="tpl-hero">
        <h1>{getSafe(p, 'name', 'Your Name')}</h1>
        <h2>{getSafe(p, 'title', 'Freelancer')}</h2>
        <p className="tpl-headline">{getSafe(p, 'hero_headline')}</p>
        <p className="tpl-tagline">{getSafe(p, 'tagline')}</p>
        {getSafe(p, 'cta_primary') && (
          <a href={`mailto:${getSafe(p, 'contact_email')}`} className="tpl-cta">
            {getSafe(p, 'cta_primary')}
          </a>
        )}
      </section>

      {/* Services */}
      {services.length > 0 && (
        <section className="tpl-services">
          <h3>Services</h3>
          <div className="tpl-services-grid">
            {services.map((s) => (
              <div key={s._index} className="tpl-service-card">
                <h4>{s.name}</h4>
                <p>{s.description}</p>
                {s.price && <p className="tpl-price">{s.price}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* About */}
      <section className="tpl-about">
        <h3>About Me</h3>
        <p>{getSafe(p, 'about_extended') || getSafe(p, 'about')}</p>
      </section>

      {/* Skills */}
      {skills.length > 0 && (
        <section className="tpl-skills">
          <h3>Skills</h3>
          <ul>
            {skills.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </section>
      )}

      {/* Portfolio / Projects */}
      {projects.length > 0 && (
        <section className="tpl-portfolio">
          <h3>Portfolio</h3>
          {projects.map((proj) => (
            <div key={proj._index} className="tpl-portfolio-item">
              <h4>{proj.name}</h4>
              {proj.tagline && <p className="tpl-project-tagline">{proj.tagline}</p>}
              <p>{proj.description}</p>
              {proj.live_url && (
                <a href={proj.live_url} target="_blank" rel="noreferrer">View</a>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="tpl-testimonials">
          <h3>Client Reviews</h3>
          {testimonials.map((t) => (
            <blockquote key={t._index}>
              <p>{t.content}</p>
              <footer>— {t.author}, {t.role}</footer>
            </blockquote>
          ))}
        </section>
      )}

      {/* Contact */}
      <section className="tpl-contact">
        <h3>Hire Me</h3>
        {getSafe(p, 'contact_email') && <p>{getSafe(p, 'contact_email')}</p>}
        <div className="tpl-social">
          {getSafe(p, 'contact_linkedin') && (
            <a href={getSafe(p, 'contact_linkedin')} target="_blank" rel="noreferrer">LinkedIn</a>
          )}
          {getSafe(p, 'contact_twitter') && (
            <a href={getSafe(p, 'contact_twitter')} target="_blank" rel="noreferrer">Twitter</a>
          )}
        </div>
      </section>
    </div>
  )
}
