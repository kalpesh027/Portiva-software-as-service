// Safe getter — never crashes if key is missing
export const getSafe = (portfolio, key, fallback = '') =>
  portfolio?.[key] ?? fallback

// Get indexed list — loops prefix_1_field, prefix_2_field, etc.
export const getList = (portfolio, prefix, fields, countKey) => {
  const count = parseInt(portfolio?.[countKey] || portfolio?.[`${prefix}_count`] || 0)
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1
    const item = {}
    fields.forEach((f) => {
      item[f] = portfolio?.[`${prefix}_${n}_${f}`] || ''
    })
    item._index = n
    return item
  })
}

export const getExperience = (p) =>
  getList(p, 'exp', ['company', 'role', 'duration', 'description', 'highlight'], 'exp_count')

export const getProjects = (p) =>
  getList(p, 'project', ['name', 'description', 'tech', 'tagline', 'live_url', 'github_url'], 'project_count')

export const getEducation = (p) =>
  getList(p, 'edu', ['degree', 'institution', 'year', 'grade'], 'edu_count')

export const getTestimonials = (p) =>
  getList(p, 'testimonial', ['author', 'role', 'content'], 'testimonial_count')

export const getBlogs = (p) =>
  getList(p, 'blog', ['title', 'summary', 'url'], 'blog_count')

export const getSkills = (p) => {
  if (p?.skills_list) return p.skills_list;
  if (Array.isArray(p?.skills)) return p.skills;
  if (typeof p?.skills === 'string') return p.skills.split(',').map(s => s.trim());
  return [];
};

// Map developer type to avatar style
const getAvatarStyle = (portfolio) => {
  const title = (portfolio?.title || '').toLowerCase()
  
  if (title.includes('designer') || title.includes('ui') || title.includes('ux')) return 'avataaars'
  if (title.includes('frontend')) return 'fun-emoji'
  if (title.includes('backend')) return 'bottts'
  if (title.includes('full stack')) return 'adventurer'
  if (title.includes('data') || title.includes('scientist')) return 'micah'
  if (title.includes('devops') || title.includes('infra')) return 'shapes'
  
  return 'avataaars' // default
}

// Get avatar URL with type-specific styling
export const getAvatarUrl = (portfolio) => {
  if (!portfolio) return '/default-avatar.png'
  
  // Primary: direct avatar_url
  if (portfolio.avatar_url) return portfolio.avatar_url
  
  // Fallback: Generate from name with developer-type-specific style
  const nameForAvatar = portfolio.name || 'Portfolio'
  const encodedName = encodeURIComponent(nameForAvatar.trim().replace(/\s+/g, '-').toLowerCase())
  const avatarStyle = getAvatarStyle(portfolio)
  return `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${encodedName}&scale=80`
}

// Get project image URL with type-specific keywords
export const getProjectImageUrl = (project, defaultImage = '/default-project.png', portfolio = null) => {
  if (!project) return defaultImage
  
  // Primary: direct image_url
  if (project.image_url) return project.image_url
  
  // Fallback: Generate random project image based on developer type theme
  if (project.name && portfolio) {
    const randomSeed = Math.floor(Math.random() * 10000)
    return `https://picsum.photos/600/400?random=${randomSeed}`
  }
  
  // Final fallback
  return defaultImage
}

// Enrich projects with image URLs based on developer type
export const getEnrichedProjects = (portfolio) => {
  const projects = getProjects(portfolio)
  return projects.map((p, _idx) => ({
    ...p,
    image_url: getProjectImageUrl(p, `/default-project.png`, portfolio),
  }))
}
