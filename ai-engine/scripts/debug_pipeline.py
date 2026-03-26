
import requests, json, sys
sys.path.insert(0, '/home/user/portfolio-ai')

OLLAMA_URL = 'http://localhost:11434/api/generate'
MODEL = 'deepseek-coder:6.7b-instruct'

# Step 1: raw Ollama test
print("=== Step 1: Raw Ollama call ===")
try:
    r = requests.post(OLLAMA_URL, json={
        'model': MODEL,
        'prompt': 'Return only this JSON and nothing else: {"test":"ok"}',
        'stream': False,
        'options': {'temperature':0.3, 'num_predict':100}
    }, timeout=60)
    print(f"Status: {r.status_code}")
    print(f"Raw response keys: {list(r.json().keys())}")
    print(f"Response text: {r.json().get('response','NO RESPONSE KEY')}")
except Exception as e:
    print(f"ERROR: {e}")

# Step 2: test with full pipeline prompt
print()
print("=== Step 2: Full pipeline test ===")
from src.prompts.portfolio_prompts import SYSTEM_PROMPT, FLOW1_PROMPT
from src.templates.template_db import get_all_templates

user_data = {"name":"Alex","title":"Developer","skills":["React"],"email":"alex@test.com"}
available = get_all_templates()

prompt = FLOW1_PROMPT.format(
    user_data=json.dumps(user_data),
    available_templates=json.dumps(available)
)
print(f"Prompt length: {len(prompt)} chars")
print(f"Prompt preview: {prompt[:200]}")
print()

try:
    r = requests.post(OLLAMA_URL, json={
        'model': MODEL,
        'prompt': f'{SYSTEM_PROMPT}\n\n{prompt}',
        'stream': False,
        'options': {'temperature':0.3,'top_p':0.9,'num_predict':1500}
    }, timeout=90)
    print(f"Status: {r.status_code}")
    d = r.json()
    print(f"Response keys: {list(d.keys())}")
    raw = d.get('response','')
    print(f"Raw output ({len(raw)} chars): {raw[:500]}")
except Exception as e:
    print(f"ERROR: {e}")
    import traceback; traceback.print_exc()
