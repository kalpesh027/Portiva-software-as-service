const TEMPLATE_DISPLAY_NAMES = {
  developer_minimal: 'Developer Minimal',
  developer_modern: 'Developer Modern',
  developer_resume_multi: 'Developer Resume Multi',
  designer_visual: 'Designer Visual',
  freelancer_cards: 'Freelancer Cards',
  developer_spline_showcase: 'Developer Spline Showcase',
}

export const getTemplateDisplayName = (templateId, fallbackName = 'Template') => {
  const normalizedId = String(templateId || '').toLowerCase()
  return TEMPLATE_DISPLAY_NAMES[normalizedId] || fallbackName
}
