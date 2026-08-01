import { describe, expect, it } from 'vitest';
import authReducer, { setUser } from './authSlice';

describe('authSlice flag coercion', () => {
  it('treats string isNewUser=true as incomplete profile', () => {
    const state = authReducer(undefined, setUser({
      id: 'u1',
      email: 'new@example.com',
      isNewUser: 'true',
    }));

    expect(state.isProfileComplete).toBe(false);
  });

  it('treats string isNewUser=false as complete profile', () => {
    const state = authReducer(undefined, setUser({
      id: 'u2',
      email: 'old@example.com',
      isNewUser: 'false',
    }));

    expect(state.isProfileComplete).toBe(true);
  });

  it('respects snake_case email_verified string flag', () => {
    const state = authReducer(undefined, setUser({
      id: 'u3',
      email: 'verify@example.com',
      email_verified: 'false',
    }));

    expect(state.isEmailVerified).toBe(false);
  });
});
