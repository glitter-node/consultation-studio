import { describe, expect, it } from 'vitest';
import { resolveCurrentUserFromAuthState } from '../TemplateApp';

describe('resolveCurrentUserFromAuthState', () => {
  it('returns the authenticated user object when present', () => {
    const user = { uuid: 'user-1', email: 'user@example.com' };

    expect(resolveCurrentUserFromAuthState({ user })).toEqual(user);
  });

  it('returns null when auth state is cleared or missing', () => {
    expect(resolveCurrentUserFromAuthState(null)).toBeNull();
    expect(resolveCurrentUserFromAuthState(undefined)).toBeNull();
    expect(resolveCurrentUserFromAuthState({})).toBeNull();
    expect(resolveCurrentUserFromAuthState({ user: null })).toBeNull();
  });
});
