TEMPLATE_STORE = {}

TEMPLATES = [
  { '_id':'developer_modern', 'name':'Modern Developer', 'category':'developer',
    'ai_description':'Dark theme with code aesthetic. Best for backend/full-stack engineers.',
    'placeholders':{'hero':['{{name}}','{{title}}','{{hero_headline}}','{{hero_subheadline}}','{{cta_primary}}'],
      'about':['{{about_bio}}','{{tagline}}'],
      'skills':['{{skills_primary}}','{{skills_secondary}}'],
      'contact':['{{contact_headline}}','{{contact_message}}','{{email}}'] } },
  { '_id':'designer_visual', 'name':'Visual Designer', 'category':'designer',
    'ai_description':'Visual-first grid for designers. Best for strong portfolio work.',
    'placeholders':{'hero':['{{name}}','{{title}}','{{hero_headline}}','{{cta_primary}}'],
      'about':['{{about_bio}}','{{tagline}}'],
      'contact':['{{contact_headline}}','{{contact_message}}','{{email}}'] } },
  { '_id':'freelancer_service', 'name':'Freelancer Service', 'category':'freelancer',
    'ai_description':'Service cards and testimonials. Best for freelancers.',
    'placeholders':{'hero':['{{name}}','{{title}}','{{hero_headline}}','{{cta_primary}}'],
      'services':['{{service_1}}','{{service_2}}','{{service_3}}'],
      'about':['{{about_bio}}'],
      'contact':['{{contact_headline}}','{{email}}'] } },
  { '_id':'student_minimal', 'name':'Student Minimal', 'category':'student',
    'ai_description':'Clean minimal layout for students and new grads.',
    'placeholders':{'hero':['{{name}}','{{title}}','{{hero_headline}}','{{cta_primary}}'],
      'about':['{{about_bio}}'],
      'skills':['{{skills_primary}}'],
      'contact':['{{contact_headline}}','{{email}}'] } },
  { '_id':'developer_timeline', 'name':'Developer Timeline', 'category':'developer',
    'ai_description':'Timeline layout for senior developers with career progression.',
    'placeholders':{'hero':['{{name}}','{{title}}','{{hero_headline}}'],
      'about':['{{about_bio}}','{{years_exp}}'],
      'contact':['{{contact_headline}}','{{email}}'] } },
  { '_id':'creator_portfolio', 'name':'Creator Portfolio', 'category':'creator',
    'ai_description':'Content-first layout for creators, bloggers and YouTubers.',
    'placeholders':{'hero':['{{name}}','{{title}}','{{hero_headline}}','{{cta_primary}}'],
      'about':['{{about_bio}}','{{tagline}}'],
      'contact':['{{contact_headline}}','{{email}}'] } },
  { '_id':'developer_minimal', 'name':'Developer Minimal', 'category':'developer',
    'ai_description':'Minimal one-page layout. Best for clean developer presentation.',
    'placeholders':{'hero':['{{name}}','{{title}}','{{hero_headline}}','{{cta_primary}}'],
      'about':['{{about_bio}}'],
      'contact':['{{contact_headline}}','{{email}}'] } },
]

for t in TEMPLATES:
    TEMPLATE_STORE[t['_id']] = t

def init_templates():
    for t in TEMPLATES:
        TEMPLATE_STORE[t['_id']] = t
    print(f'{len(TEMPLATE_STORE)} templates loaded')

def get_all_templates(template_schemas=None):
    """Return templates list. Primary source: template_schemas from Java backend.
    Falls back to hardcoded TEMPLATE_STORE if not provided."""
    if template_schemas:
        return [
            {
                'id': tid,
                'description': data.get('selection_rules', {}).get('best_for', tid),
                'placeholder_schema': data.get('placeholder_schema', {}),
                'selection_rules': data.get('selection_rules', {}),
                'template_type': data.get('template_type', 'single'),
                'required_plan': data.get('required_plan', 'free'),
            }
            for tid, data in template_schemas.items()
        ]
    return [{'id': tid, 'description': t['ai_description']}
            for tid, t in TEMPLATE_STORE.items()]

def get_templates_for_type(ptype, template_schemas=None):
    if template_schemas:
        results = [
            {'id': tid, 'description': data.get('selection_rules', {}).get('best_for', tid)}
            for tid, data in template_schemas.items()
            if data.get('selection_rules', {}).get('best_for', '').lower().startswith(ptype.lower())
        ]
        if len(results) < 2:
            results = get_all_templates(template_schemas)[:5]
        return results
    results = [{'id': tid, 'description': t['ai_description']}
               for tid, t in TEMPLATE_STORE.items()
               if t.get('category') == ptype]
    if len(results) < 2:
        results = get_all_templates()[:5]
    return results

def get_template_placeholders(template_id, template_schemas=None):
    if template_schemas and template_id in template_schemas:
        schema = template_schemas[template_id].get('placeholder_schema', {})
        out = []
        for section_keys in schema.values():
            if isinstance(section_keys, list):
                out.extend(section_keys)
        return out
    t = TEMPLATE_STORE.get(template_id)
    if not t:
        return []
    out = []
    for phs in t['placeholders'].values():
        out.extend(phs)
    return out

def add_template(template):
    TEMPLATE_STORE[template['_id']] = template
    return {'status': 'saved', 'id': template['_id']}
