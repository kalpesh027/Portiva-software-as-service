const STATIC_TEMPLATE_PREVIEWS = {
  developer_minimal: '/template-images/developer-minimal.png',
  developer_modern: '/template-images/developer-modern.png',
  developer_resume_multi: '/template-images/developer-resume-multi.png',
  designer_visual: '/template-images/designer-visual.png',
  freelancer_cards: '/template-images/freelancer-cards.png',
  developer_spline_showcase: '/template-images/developer-spline-showcase.svg',
}

export const getTemplatePreviewImage = (templateId, fallbackImage) => {
  const normalizedId = String(templateId || '').toLowerCase()
  return STATIC_TEMPLATE_PREVIEWS[normalizedId] || fallbackImage
}
