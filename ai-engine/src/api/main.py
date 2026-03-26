
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import json, time, uuid, asyncio, os
from concurrent.futures import ThreadPoolExecutor
import redis
from loguru import logger
from src.pipeline.ai_engine import run_portfolio_pipeline

_executor = ThreadPoolExecutor(max_workers=2)

app = FastAPI(title='Portfolio AI Engine', version='2.0.0')
app.add_middleware(CORSMiddleware, allow_origins=['*'],
    allow_methods=['*'], allow_headers=['*'])

# FIX 1: Real Redis cache (optional in local dev)
REDIS_ENABLED = os.getenv('REDIS_ENABLED', 'true').lower() in ('1', 'true', 'yes', 'on')
redis_client = None
_redis_available = False

if REDIS_ENABLED:
    try:
        redis_client = redis.Redis(
            host=os.getenv('REDIS_HOST', 'localhost'),
            port=int(os.getenv('REDIS_PORT', 6379)),
            db=0,
            decode_responses=True,
            socket_connect_timeout=1,
            socket_timeout=1,
        )
        redis_client.ping()
        _redis_available = True
        logger.info('Redis cache enabled')
    except Exception as e:
        logger.warning(f'Redis unavailable, continuing without cache: {e}')
        redis_client = None
        _redis_available = False
else:
    logger.info('Redis disabled via REDIS_ENABLED=false')

def cache_get(key):
    if not _redis_available or redis_client is None:
        return None
    try:
        return redis_client.get(key)
    except Exception:
        return None

def cache_set(key, value, ttl=86400):  # 24hr TTL
    if not _redis_available or redis_client is None:
        return
    try:
        redis_client.setex(key, ttl, value)
    except Exception:
        return

def cache_delete_pattern(pattern):
    if not _redis_available or redis_client is None:
        return 0
    try:
        keys = redis_client.keys(pattern)
        if keys: redis_client.delete(*keys)
        return len(keys)
    except:
        return 0

# In-memory job store (status tracking only)
jobs: Dict[str, dict] = {}

# ── Models ────────────────────────────────────────────────────────────
class GenerateRequest(BaseModel):
    user_id: str
    user_data: dict
    template_id: Optional[str] = None
    force_regenerate: bool = False
    flow: Optional[str] = None

class SwitchTemplateRequest(BaseModel):
    user_id: str
    new_template_id: str
    user_data: dict
    template_schemas: Optional[Dict[str, Any]] = None  # FIX 3

class PreGenerateRequest(BaseModel):
    user_id: str
    user_data: dict
    template_id: Optional[str] = None
    flow: Optional[str] = None
    template_schemas: Optional[Dict[str, Any]] = None  # FIX 3

# ── Background generation ─────────────────────────────────────────────
async def generate_background(user_id, user_data, template_id, flow, cache_key, template_schemas=None):
    jobs[user_id] = {
        'status': 'generating',
        'started': time.time(),
        'user_id': user_id
    }
    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            _executor,
            lambda: run_portfolio_pipeline(
                user_data=user_data,
                template_id=template_id,
                flow=flow,
                template_schemas=template_schemas
            )
        )
        cache_set(cache_key, json.dumps(result))                          # original key
        cache_set(f'portfolio:{user_id}:auto', json.dumps(result))       # FIX 2: always set :auto
        jobs[user_id] = {
            'status': 'done',
            'completed': time.time(),
            'result': result
        }
        logger.info(f'Generation complete: {user_id}')
    except Exception as e:
        jobs[user_id] = {
            'status': 'error',
            'error': str(e)
        }
        logger.error(f'Generation failed: {user_id} — {e}')

# ── Endpoints ─────────────────────────────────────────────────────────

@app.get('/health')
def health():
    return {'status': 'healthy', 'version': '2.0.0'}

# Java backend calls this right when user signs up
# Returns instantly — generation happens in background
@app.post('/api/pre-generate')
async def pre_generate(req: PreGenerateRequest, background_tasks: BackgroundTasks):
    """
    Call this immediately when user signs up.
    Returns instantly. AI generates in background.
    Poll /api/status/{user_id} to check when ready.
    """
    cache_key = f'portfolio:{req.user_id}:{req.template_id or "auto"}'

    # Already cached — nothing to do
    cached = cache_get(cache_key)
    if cached:
        return {'status': 'already_ready', 'user_id': req.user_id}

    # Already generating — don't start again
    if jobs.get(req.user_id, {}).get('status') == 'generating':
        return {'status': 'already_generating', 'user_id': req.user_id}

    # Start background generation
    background_tasks.add_task(
        generate_background,
        req.user_id, req.user_data,
        req.template_id, req.flow, cache_key,
        req.template_schemas  # FIX 3
    )

    return {
        'status': 'started',
        'user_id': req.user_id,
        'poll_url': f'/api/status/{req.user_id}',
        'message': 'Generation started in background'
    }

# Java backend polls this — returns done + data when ready
@app.get('/api/status/{user_id}')
def get_status(user_id: str):
    """
    Poll this every 10 seconds after pre-generate.
    Returns status: generating | done | error
    When done, returns full portfolio data.
    """
    # Check cache first
    cache_key = f'portfolio:{user_id}:auto'
    cached = cache_get(cache_key)
    if cached and user_id not in jobs:
        return {'status': 'done', 'source': 'cache', **json.loads(cached)}

    job = jobs.get(user_id)
    if not job:
        return {'status': 'not_started'}

    if job['status'] == 'done':
        elapsed = job.get('completed', time.time()) - job.get('started', time.time())
        return {
            'status': 'done',
            'source': 'generated',
            'elapsed_seconds': round(elapsed),
            **job['result']
        }

    if job['status'] == 'error':
        return {'status': 'error', 'error': job['error']}

    elapsed = time.time() - job.get('started', time.time())
    return {
        'status': 'generating',
        'elapsed_seconds': round(elapsed),
        'message': 'Still generating — poll again in 10 seconds'
    }

# Java backend calls this to get portfolio for page render
@app.get('/api/portfolio/{user_id}')
def get_portfolio(user_id: str):
    """
    Call this when rendering user portfolio page.
    Returns portfolio data if ready, or status if still generating.
    """
    cache_key = f'portfolio:{user_id}:auto'
    cached = cache_get(cache_key)
    if cached:
        data = json.loads(cached)
        return {
            'ready': True,
            'template': data.get('template'),
            'placeholder_map': data.get('placeholder_map', {})
        }

    job = jobs.get(user_id, {})
    if job.get('status') == 'generating':
        elapsed = time.time() - job.get('started', time.time())
        return {
            'ready': False,
            'status': 'generating',
            'elapsed_seconds': round(elapsed),
            'fallback': _get_fallback(user_id)
        }

    return {'ready': False, 'status': 'not_started'}

# Main generate endpoint — for direct calls and force regenerate
@app.post('/api/generate')
async def generate_portfolio(req: GenerateRequest, background_tasks: BackgroundTasks):
    cache_key = f'portfolio:{req.user_id}:{req.template_id or "auto"}'

    if not req.force_regenerate:
        cached = cache_get(cache_key)
        if cached:
            return {'source': 'cache', **json.loads(cached)}

    job = jobs.get(req.user_id, {})
    if job.get('status') == 'generating':
        elapsed = time.time() - job.get('started', time.time())
        return {
            'source': 'generating',
            'elapsed_seconds': round(elapsed),
            'poll_url': f'/api/status/{req.user_id}'
        }

    background_tasks.add_task(
        generate_background,
        req.user_id, req.user_data,
        req.template_id, req.flow, cache_key
    )

    return {
        'source': 'started',
        'poll_url': f'/api/status/{req.user_id}'
    }

# Switch template — background
@app.post('/api/switch-template')
async def switch_template(req: SwitchTemplateRequest, background_tasks: BackgroundTasks):
    job = jobs.get(req.user_id, {})
    if job.get('status') == 'generating':
        elapsed = time.time() - job.get('started', time.time())
        return {
            'status': 'already_generating',
            'elapsed_seconds': round(elapsed),
            'poll_url': f'/api/status/{req.user_id}'
        }

    # Clear stale cache from previous runs so status polling cannot return old template data.
    cache_delete_pattern(f'portfolio:{req.user_id}:*')

    # Mark generating immediately to avoid race window before background task starts.
    jobs[req.user_id] = {
        'status': 'generating',
        'started': time.time(),
        'user_id': req.user_id,
    }

    cache_key = f'portfolio:{req.user_id}:{req.new_template_id}'
    background_tasks.add_task(
        generate_background,
        req.user_id, req.user_data,
        req.new_template_id, 'switch_template', cache_key,
        req.template_schemas  # FIX 3
    )
    return {'status': 'started', 'poll_url': f'/api/status/{req.user_id}'}

@app.delete('/api/cache/{user_id}')
def clear_cache(user_id: str):
    count = cache_delete_pattern(f'portfolio:{user_id}:*')  # FIX 1
    if user_id in jobs: del jobs[user_id]
    return {'cleared': count}

@app.get('/api/templates')
def list_templates():
    from src.templates.template_db import get_all_templates
    return {'templates': get_all_templates()}

# Fallback content while AI generates
def _get_fallback(user_id):
    return {
        'message': 'Your portfolio is being prepared',
        'estimated_time': '2-3 minutes'
    }
