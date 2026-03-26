const templateLoaders = {
  developer_minimal: () => import('./developer_minimal/index.jsx'),
  developer_modern: () => import('./developer_modern/index.jsx'),
  developer_resume_multi: () => import('./developer_resume_multi/index.jsx'),
  developer_spline_showcase: () => import('./developer_spline_showcase/index.jsx'),
  designer_visual: () => import('./designer_visual/index.jsx'),
  freelancer_cards: () => import('./freelancer_cards/index.jsx'),
}

const DEFAULT_TEMPLATE = 'developer_minimal'

export function getTemplate(templateId) {
  return templateLoaders[templateId] || templateLoaders[DEFAULT_TEMPLATE]
}

export const TEMPLATE_IDS = Object.keys(templateLoaders)

export default templateLoaders
