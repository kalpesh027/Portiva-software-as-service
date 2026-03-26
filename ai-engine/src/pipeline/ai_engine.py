
import json, requests, re
from loguru import logger
from tenacity import retry, stop_after_attempt, wait_exponential
from src.prompts.portfolio_prompts import *

OLLAMA_URL = 'http://localhost:11434/api/generate'
MODEL = 'qwen2.5:1.5b'

def clean_json_response(text):
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text).strip()
    match = re.search(r'(\{.*\}|\[.*\])', text, re.DOTALL)
    if match: return match.group(1)
    try:
        from json_repair import repair_json
        return repair_json(text)
    except: return text

@retry(stop=stop_after_attempt(2), wait=wait_exponential(min=1, max=4))
def _llm_call_with_retry(prompt, system=SYSTEM_PROMPT):
    logger.info(f'Calling model... (this takes 2-5 min on CPU)')
    r = requests.post(OLLAMA_URL, json={
        'model': MODEL,
        'prompt': f'{system}\n\n{prompt}',
        'stream': False,
        'options': {
            'temperature': 0.3,
            'top_p': 0.9,
            'num_predict': 600,
            'num_ctx': 2048,
            'repeat_penalty': 1.1,
            'stop': ['}\n}', '```'],
        }
    }, timeout=360)

    resp_json = r.json()
    if 'error' in resp_json:
        raise RuntimeError(f"Ollama error: {resp_json['error']}")

    raw = (resp_json.get('response') or '').strip()
    if not raw:
        raise RuntimeError(f"Ollama returned empty response. Status: {r.status_code}")

    logger.info(f'Model responded: {len(raw)} chars')
    cleaned = clean_json_response(raw)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        logger.error(f'JSON parse failed. Raw response (first 500 chars): {raw[:500]}')
        logger.error(f'Cleaned (first 500 chars): {cleaned[:500]}')
        raise


def llm_call(prompt, system=SYSTEM_PROMPT):
    try:
        return _llm_call_with_retry(prompt, system)
    except Exception as e:
        logger.error(f"LLM Call failed entirely after retries: {e}")
        logger.warning("Returning empty dict as fallback to unblock generation pipeline.")
        return {}

def run_portfolio_pipeline(user_data, template_id=None, existing_content=None, flow=None,
                           template_schemas=None):  # FIX 4
    name = user_data.get('name', 'Professional')
    logger.info(f'Pipeline start | user={name} | flow={flow}')

    # Flow 2: user switched template from dashboard
    # template_id is already set — do NOT re-score, respect user choice
    if flow == 'switch_template' and template_id:
        if template_schemas and template_id in template_schemas:
            schema = template_schemas[template_id]['placeholder_schema']
            pm = build_direct_placeholders(user_data, schema)
            ai_keys = expand_ai_keys(schema.get('ai_keys', []), pm)
            pm.update(llm_call(FLOW2_PROMPT_SCHEMA.format(
                user_data=json.dumps(user_data),
                template_id=template_id,
                pm_so_far=json.dumps(pm),
                ai_keys=json.dumps(ai_keys))))
            return {'template': template_id, 'placeholder_map': pm}
        else:
            # Fallback to existing FLOW2_PROMPT if no schemas sent
            from src.templates.template_db import get_template_placeholders
            new_phs = get_template_placeholders(template_id)
            result = llm_call(FLOW2_PROMPT.format(
                user_data=json.dumps(user_data),
                previous_template=existing_content.get('template', 'unknown') if existing_content else 'unknown',
                new_template=template_id,
                existing_content=json.dumps(existing_content.get('placeholder_map', {}) if existing_content else {}),
                new_placeholders=json.dumps(new_phs)))
            return result

    # Flow 3: template already known
    if template_id and flow != 'auto':
        from src.templates.template_db import get_template_placeholders
        phs = get_template_placeholders(template_id)
        result = llm_call(FLOW3_PROMPT.format(
            user_data=json.dumps(user_data),
            template_id=template_id,
            placeholders_needed=json.dumps(phs)))
        return result

    # Flow 1: auto select and generate
    if template_schemas:
        # Score each template against user profile — no LLM needed for selection
        chosen_template = score_templates(user_data, template_schemas)
        logger.info(f'Template selected by scoring: {chosen_template}')
        schema = template_schemas[chosen_template]['placeholder_schema']
        pm = build_direct_placeholders(user_data, schema)
        ai_keys = expand_ai_keys(schema.get('ai_keys', []), pm)
        pm.update(llm_call(FLOW1_PROMPT_SCHEMA.format(
            user_data=json.dumps(user_data),
            chosen_template=chosen_template,
            pm_so_far=json.dumps(pm),
            ai_keys=json.dumps(ai_keys))))
        return {'template': chosen_template, 'placeholder_map': pm}
    else:
        # Fallback: let LLM decide from available_templates
        from src.templates.template_db import get_all_templates
        available = get_all_templates()
        result = llm_call(FLOW1_PROMPT.format(
            user_data=json.dumps(user_data),
            available_templates=json.dumps(available)))
        return result


# ── FIX 5: Helper functions ──────────────────────────────────────────────────
def score_templates(user_data: dict, template_schemas: dict) -> str:
    has_exp  = len(user_data.get('experience', [])) > 0
    has_proj = len(user_data.get('projects', [])) > 0
    has_blogs= len(user_data.get('blogs', [])) > 0
    has_test = len(user_data.get('testimonials', [])) > 0
    skill_n  = len(user_data.get('skills', []))
    exp_n    = len(user_data.get('experience', []))
    proj_n   = len(user_data.get('projects', []))
    scores = {}
    for tid, schema in template_schemas.items():
        rules = schema.get('selection_rules', {})
        score = 0
        if rules.get('requires_experience')   and not has_exp:  continue
        if rules.get('requires_projects')     and not has_proj: continue
        if rules.get('requires_blogs')        and not has_blogs:continue
        if rules.get('requires_testimonials') and not has_test: continue
        if skill_n < rules.get('min_skills', 0): continue
        w = rules.get('score_weights', {})
        if has_exp:  score += w.get('has_experience', 0)
        if has_proj: score += w.get('has_projects', 0)
        if has_test: score += w.get('has_testimonials', 0)
        if has_blogs:score += w.get('has_blogs', 0)
        score += skill_n * w.get('skill_count', 0)
        score += exp_n   * w.get('exp_count', 0)
        score += proj_n  * w.get('project_count', 0)
        scores[tid] = score
    if not scores:
        return 'developer_minimal'
    return max(scores, key=scores.get)


def build_direct_placeholders(user_data: dict, schema: dict) -> dict:
    pm = {}
    req = schema.get('required', [])
    if 'name'   in req: pm['name']  = user_data.get('name', '')
    if 'title'  in req: pm['title'] = user_data.get('title', '')
    if 'about'  in req: pm['about'] = user_data.get('about', '')
    if 'skills' in req:
        pm['skills']       = ', '.join(user_data.get('skills', []))
        pm['skills_list']  = user_data.get('skills', [])
        pm['skills_count'] = str(len(user_data.get('skills', [])))
    contact = user_data.get('contact', {})
    for key in schema.get('contact', []):
        pm[key] = contact.get(key.replace('contact_', ''), '')
    for arr, prefix, fields in [
        ('experience',   'exp',         ['company', 'role', 'duration', 'description']),
        ('projects',     'project',     ['name', 'description', 'liveUrl', 'githubUrl']),
        ('education',    'edu',         ['degree', 'institution', 'year', 'grade']),
        ('testimonials', 'testimonial', ['author', 'role', 'content']),
        ('blogs',        'blog',        ['title', 'summary', 'url']),
    ]:
        if arr not in schema: continue
        items = user_data.get(arr, [])
        pm[f'{prefix}_count'] = str(len(items))
        for i, item in enumerate(items, start=1):
            for f in fields:
                key = f'{prefix}_{i}_{f}'
                if prefix == 'project' and f == 'liveUrl':   key = f'project_{i}_live_url'
                if prefix == 'project' and f == 'githubUrl': key = f'project_{i}_github_url'
                if prefix == 'project' and f == 'name':      key = f'project_{i}_name'
                if 'techStack' in item and prefix == 'project':
                    pm[f'project_{i}_tech'] = ', '.join(item.get('techStack', []))
                pm[key] = item.get(f, '')
    pm['projects_count']   = pm.get('project_count', '0')
    pm['years_experience'] = _calc_years(user_data.get('experience', []))
    return pm


def expand_ai_keys(ai_keys: list, pm: dict) -> list:
    expanded = []
    exp_n  = int(pm.get('exp_count', 0))
    proj_n = int(pm.get('project_count', 0))
    for k in ai_keys:
        if '_N_' in k:
            if k.startswith('exp_') and exp_n > 0:
                expanded += [k.replace('_N_', f'_{n}_') for n in range(1, exp_n + 1)]
            elif k.startswith('project_') and proj_n > 0:
                expanded += [k.replace('_N_', f'_{n}_') for n in range(1, proj_n + 1)]
        else:
            expanded.append(k)
    return expanded


def _calc_years(experience: list) -> str:
    import re, datetime
    earliest = None
    for exp in experience:
        dur = exp.get('duration', '')
        years = re.findall(r'\b(19|20)\d{2}\b', dur)
        if years:
            y = int(min(years))
            if earliest is None or y < earliest:
                earliest = y
    if earliest:
        return str(datetime.datetime.now().year - earliest)
    return str(len(experience)) if experience else '0'
