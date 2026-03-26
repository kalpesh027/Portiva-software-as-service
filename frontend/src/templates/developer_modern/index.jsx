import { getSafe, getSkills, getExperience, getProjects, getTestimonials, getAvatarUrl, getEnrichedProjects } from '../_base/placeholder_helpers'

/**
 * Developer Modern — single-page template.
 * Dark theme with code aesthetic for experienced developers.
 * Replace this stub with real JSX when ready.
 */
export default function DeveloperModern({ portfolio: p }) {
  const skills = getSkills(p)
  const experience = getExperience(p)
  const projects = getEnrichedProjects(p)
  const testimonials = getTestimonials(p)

  return (
    <div className="tpl-developer-modern">
      {/* Hero */}
      <section className="tpl-hero">
        <h1>{getSafe(p, 'name', 'Your Name')}</h1>
        <h2>{getSafe(p, 'title', 'Software Engineer')}</h2>
        <p className="tpl-headline">{getSafe(p, 'hero_headline')}</p>
        <p className="tpl-tagline">{getSafe(p, 'tagline')}</p>
        <div className="tpl-ctas">
          {getSafe(p, 'cta_primary') && (
            <a href={`mailto:${getSafe(p, 'contact_email')}`} className="tpl-cta-primary">
              {getSafe(p, 'cta_primary')}
            </a>
          )}
          {getSafe(p, 'cta_secondary') && (
            <a href={getSafe(p, 'contact_github')} className="tpl-cta-secondary" target="_blank" rel="noreferrer">
              {getSafe(p, 'cta_secondary')}
            </a>
          )}
        </div>
      </section>

      {/* About */}
      <section className="tpl-about">
        <h3>About Me</h3>
        <p>{getSafe(p, 'about_extended') || getSafe(p, 'about')}</p>
        {getSafe(p, 'years_experience') && (
          <p><strong>{getSafe(p, 'years_experience')} years</strong> of experience</p>
        )}
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

      {/* Experience */}
      {experience.length > 0 && (
        <section className="tpl-experience">
          <h3>Experience</h3>
          {experience.map((e) => (
            <div key={e._index} className="tpl-exp-item">
              <h4>{e.role} — {e.company}</h4>
              <span>{e.duration}</span>
              {e.highlight && <p className="tpl-highlight">{e.highlight}</p>}
              {e.description && <p>{e.description}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="tpl-projects">
          <h3>Projects</h3>
          {projects.map((proj) => (
            <div key={proj._index} className="tpl-project-item">
              <h4>{proj.name}</h4>
              {proj.tagline && <p className="tpl-project-tagline">{proj.tagline}</p>}
              <p>{proj.description}</p>
              {proj.tech && <p><small>{proj.tech}</small></p>}
              <div className="tpl-project-links">
                {proj.live_url && <a href={proj.live_url} target="_blank" rel="noreferrer">Live Demo</a>}
                {proj.github_url && <a href={proj.github_url} target="_blank" rel="noreferrer">GitHub</a>}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="tpl-testimonials">
          <h3>Testimonials</h3>
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
        <h3>Get In Touch</h3>
        {getSafe(p, 'contact_email') && <p>{getSafe(p, 'contact_email')}</p>}
        <div className="tpl-social">
          {getSafe(p, 'contact_linkedin') && (
            <a href={getSafe(p, 'contact_linkedin')} target="_blank" rel="noreferrer">LinkedIn</a>
          )}
          {getSafe(p, 'contact_github') && (
            <a href={getSafe(p, 'contact_github')} target="_blank" rel="noreferrer">GitHub</a>
          )}
          {getSafe(p, 'contact_twitter') && (
            <a href={getSafe(p, 'contact_twitter')} target="_blank" rel="noreferrer">Twitter</a>
          )}
        </div>
      </section>
    </div>
  )
}
