import { getSafe, getSkills, getProjects, getTestimonials, getAvatarUrl, getEnrichedProjects } from '../_base/placeholder_helpers'

/**
 * Designer Visual — single-page template.
 * Visual-first grid for designers with strong portfolio work.
 * Replace this stub with real JSX when ready.
 */
export default function DesignerVisual({ portfolio: p }) {
  const skills = getSkills(p)
  const projects = getEnrichedProjects(p)
  const testimonials = getTestimonials(p)

  return (
    <div className="tpl-designer-visual">
      {/* Hero */}
      <section className="tpl-hero">
        <h1>{getSafe(p, 'name', 'Your Name')}</h1>
        <h2>{getSafe(p, 'title', 'Designer')}</h2>
        <p className="tpl-headline">{getSafe(p, 'hero_headline')}</p>
        <p className="tpl-tagline">{getSafe(p, 'tagline')}</p>
        {getSafe(p, 'cta_primary') && (
          <a href={`mailto:${getSafe(p, 'contact_email')}`} className="tpl-cta">
            {getSafe(p, 'cta_primary')}
          </a>
        )}
      </section>

      {/* About */}
      <section className="tpl-about">
        <h3>About</h3>
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

      {/* Work / Projects */}
      {projects.length > 0 && (
        <section className="tpl-work">
          <h3>Work</h3>
          <div className="tpl-work-grid">
            {projects.map((proj) => (
              <div key={proj._index} className="tpl-work-item">
                <h4>{proj.name}</h4>
                {proj.tagline && <p className="tpl-project-tagline">{proj.tagline}</p>}
                <p>{proj.description}</p>
                {proj.live_url && (
                  <a href={proj.live_url} target="_blank" rel="noreferrer">View Project</a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="tpl-testimonials">
          <h3>What Clients Say</h3>
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
        <h3>Let's Work Together</h3>
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
