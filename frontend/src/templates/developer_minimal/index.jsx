import { getSafe, getSkills, getExperience, getProjects, getAvatarUrl } from '../_base/placeholder_helpers'

/**
 * Developer Minimal — single-page template.
 * Clean, minimal layout for developers.
 * Replace this stub with real JSX when ready.
 */
export default function DeveloperMinimal({ portfolio: p }) {
  const skills = getSkills(p)
  const experience = getExperience(p)
  const projects = getProjects(p)
  const avatarSrc = getAvatarUrl(p)

  return (
    <div className="tpl-developer-minimal">
      {/* Hero */}
      <section className="tpl-hero">
        <img
          src={avatarSrc}
          alt={getSafe(p, 'name', 'Profile')}
          onError={(e) => {
            e.currentTarget.src = '/default-avatar.png'
          }}
          style={{
            width: 112,
            height: 112,
            borderRadius: '50%',
            objectFit: 'cover',
            display: 'block',
            marginBottom: 16,
            border: '3px solid #8B5CF6',
            boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
          }}
        />
        <h1>{getSafe(p, 'name', 'Your Name')}</h1>
        <h2>{getSafe(p, 'title', 'Software Developer')}</h2>
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
        <p>{getSafe(p, 'about')}</p>
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
              <p>{e.highlight || e.description}</p>
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
              <p>{proj.description}</p>
              {proj.tech && <p><small>{proj.tech}</small></p>}
              <div className="tpl-project-links">
                {proj.live_url && <a href={proj.live_url} target="_blank" rel="noreferrer">Live</a>}
                {proj.github_url && <a href={proj.github_url} target="_blank" rel="noreferrer">GitHub</a>}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Contact */}
      <section className="tpl-contact">
        <h3>Contact</h3>
        {getSafe(p, 'contact_email') && <p>{getSafe(p, 'contact_email')}</p>}
        {getSafe(p, 'contact_linkedin') && (
          <a href={getSafe(p, 'contact_linkedin')} target="_blank" rel="noreferrer">LinkedIn</a>
        )}
        {getSafe(p, 'contact_github') && (
          <a href={getSafe(p, 'contact_github')} target="_blank" rel="noreferrer">GitHub</a>
        )}
      </section>
    </div>
  )
}
