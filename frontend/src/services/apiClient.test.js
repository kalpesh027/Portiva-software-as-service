import { beforeEach, describe, expect, it, vi } from 'vitest';

const requestUse = vi.fn();
const responseUse = vi.fn();
const get = vi.fn();
const post = vi.fn();
const put = vi.fn();
const patch = vi.fn();
const del = vi.fn();

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: requestUse },
        response: { use: responseUse },
      },
      get,
      post,
      put,
      patch,
      delete: del,
    })),
  },
}));

describe('apiClient interceptors', () => {
  beforeEach(() => {
    localStorage.clear();
    requestUse.mockClear();
    responseUse.mockClear();
    get.mockReset();
    post.mockReset();
    put.mockReset();
    patch.mockReset();
    del.mockReset();
    vi.resetModules();
  });

  it('adds bearer token in request interceptor when token exists', async () => {
    localStorage.setItem('portify-token', 'token-123');
    await import('./apiClient');

    const onRequest = requestUse.mock.calls[0][0];
    const cfg = await onRequest({ headers: {} });

    expect(cfg.headers.Authorization).toBe('Bearer token-123');
  });

  it('normalizes response errors and clears token on 401', async () => {
    localStorage.setItem('portify-token', 'token-abc');
    await import('./apiClient');

    const onError = responseUse.mock.calls[0][1];

    await expect(
      onError({ response: { status: 401, data: { message: 'Unauthorized' } } })
    ).rejects.toMatchObject({
      message: 'Unauthorized',
      response: { status: 401, data: { message: 'Unauthorized' } },
    });

    expect(localStorage.getItem('portify-token')).toBeNull();
  });
});
