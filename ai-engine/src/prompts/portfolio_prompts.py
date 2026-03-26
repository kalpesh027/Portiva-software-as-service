
"""All prompts used by the 3-flow AI pipeline."""
 
SYSTEM_PROMPT = """
You are PortfolioAI, an expert portfolio content writer.
Rules you MUST follow:
1. Return ONLY valid JSON. No preamble. No explanation. No markdown backticks.
2. Never invent facts not present in the user data.
3. All content must be professional and portfolio-ready.
4. If a field is missing, generate a reasonable professional default.
"""
 
# Flow 1: User has no template — AI selects and generates
FLOW1_PROMPT = """
Analyze this user profile, select the best matching template, then generate
content for all placeholders in that template.
 
User Data: {user_data}
Available Templates: {available_templates}
 
Return ONLY this JSON:
{{
  "selected_template": "template_id",
  "selection_reason": "one sentence why",
  "placeholder_map": {{ "{{placeholder}}": "value" }}
}}
"""
 
# Flow 2: User switches template — preserve existing content
FLOW2_PROMPT = """
The user has switched to a new template. Reuse existing content where possible.
IMPORTANT: The user chose this template — do NOT suggest a different one.
 
User Data: {user_data}
Previous Template: {previous_template}
New Template (user chose this): {new_template}
Existing Content: {existing_content}
New Template Placeholders: {new_placeholders}
 
Return ONLY this JSON:
{{
  "template": "{new_template}",
  "reused_sections": ["list of placeholder keys reused from existing content"],
  "placeholder_map": {{ "{{placeholder}}": "value" }}
}}
"""
 
# Flow 3: Template already known — fill placeholders directly
FLOW3_PROMPT = """
Generate content for every placeholder in this template.
 
User Data: {user_data}
Template: {template_id}
Placeholders Needed: {placeholders_needed}
 
Return ONLY this JSON:
{{
  "template": "{template_id}",
  "placeholder_map": {{ "{{placeholder}}": "value" }}
}}
"""

# FIX 6: Flow 1 with schema-driven generation (template already chosen by scoring)
FLOW1_PROMPT_SCHEMA = """
You are generating portfolio content. Template already chosen: {chosen_template}
User profile: {user_data}
Already generated (direct copy values): {pm_so_far}
Generate ONLY these keys as a JSON object — nothing else:
{ai_keys}

RULES:
1. hero_headline: about their WORK, not their name
   BAD: 'Rahul Sharma - Developer'  GOOD: 'Building systems that scale'
2. tagline: max 8 words, punchy
3. exp_N_highlight: one quantified achievement from that job
4. project_N_tagline: one line about what that project does
5. seo_description: max 150 characters
6. years_experience: string number e.g. '3'
7. personal_quote: one short, memorable line that sounds authentic and professional
8. Return ONLY valid JSON. No markdown. No explanation.
"""

# FIX 6: Flow 2 with schema-driven generation (user switched template, respect their choice)
FLOW2_PROMPT_SCHEMA = """
User switched to template: {template_id}. Do NOT change template choice.
User profile: {user_data}
Already generated (direct copy): {pm_so_far}
Generate ONLY these keys — for the NEW template:
{ai_keys}

RULES: same as above. Return ONLY valid JSON.
"""
