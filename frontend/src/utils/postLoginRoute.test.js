import { describe, it, expect } from 'vitest';
import { getPostLoginRoute } from './postLoginRoute';

describe('getPostLoginRoute', () => {
  it('returns admin route for admin users', () => {
    expect(getPostLoginRoute({ isProfileComplete: false, role: 'admin' })).toBe('/admin');
    expect(getPostLoginRoute({ isProfileComplete: true, role: 'ADMIN' })).toBe('/admin');
  });

  it('returns onboarding route for incomplete profile', () => {
    expect(getPostLoginRoute({ isProfileComplete: false })).toBe('/onboarding');
  });

  it('returns dashboard route for complete profile', () => {
    expect(getPostLoginRoute({ isProfileComplete: true })).toBe('/dashboard');
  });
});
