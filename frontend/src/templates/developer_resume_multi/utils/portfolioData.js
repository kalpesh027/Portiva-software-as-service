import { getEducation, getExperience, getProjects, getSkills, getBlogs, getProjectImageUrl } from '../../_base/placeholder_helpers'

export const normalizeList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

export const getHeroRoles = (portfolio) => {
  const explicit = normalizeList(portfolio?.hero_roles)
  if (explicit.length > 0) return explicit

  const skills = getSkills(portfolio)
  const derived = [
    portfolio?.title,
    skills[0] ? `${skills[0]} Developer` : null,
    skills[1] ? `${skills[1]} Engineer` : null,
    'Open Source Contributor',
  ].filter(Boolean)

  return [...new Set(derived)]
}

export const getInterestList = (portfolio) => normalizeList(portfolio?.interests_list)

export const getToolList = (portfolio) => normalizeList(portfolio?.tools_list)

export const getGithubUsername = (portfolio) => {
  const github = portfolio?.contact_github || ''
  const match = github.match(/github\.com\/([^/?#]+)/i)
  return match?.[1] || ''
}

export const getFeaturedSkills = (portfolio, limit = 5) => getSkills(portfolio).slice(0, limit)

export const getEnhancedProjects = (portfolio) =>
  getProjects(portfolio).map((project, _idx) => ({
    ...project,
    image_url: getProjectImageUrl(project) || `/default-project.png`,
    is_blog: String(portfolio?.[`project_${project._index}_is_blog`] || '').toLowerCase() === 'true',
  }))

export const getPrimaryExperience = (portfolio) => getExperience(portfolio)[0] || null

export const getPrimaryEducation = (portfolio) => getEducation(portfolio)[0] || null

export const getPrimaryBlogUrl = (portfolio) => getBlogs(portfolio)[0]?.url || ''
