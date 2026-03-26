import requests, json

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "deepseek-coder:6.7b-instruct"

def ask_model(prompt: str) -> str:
    response = requests.post(OLLAMA_URL, json={
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.3,  # Low = more consistent/deterministic
            "top_p": 0.9,
            "num_predict": 1000, # Max output tokens
        }
    })
    return response.json()["response"]

# Test 1: Basic JSON output
prompt = """
You are a portfolio content writer. Return ONLY valid JSON, no explanations.

Generate a hero section for this user:
Name: Alex Kumar
Title: Full Stack Developer
Skills: React, Node.js, PostgreSQL

Return this exact JSON structure:
{
    "headline": "compelling headline max 10 words",
    "subheadline": "specialization description 15-20 words",
    "cta": "call to action text"
}
"""

print("Testing model...")
result = ask_model(prompt)
print("Raw output:")
print(result)

# Try to parse as JSON
try:
    parsed = json.loads(result.strip())
    print()
    print("✅ Valid JSON received!")
    print(json.dumps(parsed, indent=2))
except json.JSONDecodeError as e:
    print(f"⚠️ JSON parse error: {e}")
    print("The model returned non-JSON - we will fix this with better prompts in")
