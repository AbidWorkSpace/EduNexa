'use client';

import { useSetState } from 'minimal-shared/hooks';
import { useRef, useMemo, useEffect, useCallback } from 'react';

import { refreshSession } from './action';
import { AuthContext } from '../auth-context';
import {
  getAccessToken,
  migrateSessionStorageAuth,
} from './auth-storage';
import {
  clearSession,
  isValidToken,
  getStoredUser,
  getRefreshToken,
  getAccessTokenExpiryMsForScheduling,
} from './utils';

// Proactive refresh: run refresh this many ms before access token expires
const REFRESH_BEFORE_MS = 2 * 60 * 1000;

// ----------------------------------------------------------------------

export function AuthProvider({ children }) {
  const { state, setState } = useSetState({ user: null, loading: true });
  const refreshTimerRef = useRef(null);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const scheduleProactiveRefresh = useCallback(() => {
    clearRefreshTimer();
    if (typeof window === 'undefined') return;

    const expiresMs = getAccessTokenExpiryMsForScheduling();
    if (!expiresMs) return;

    const now = Date.now();
    const delay = Math.max(0, expiresMs - now - REFRESH_BEFORE_MS);

    refreshTimerRef.current = setTimeout(async () => {
      refreshTimerRef.current = null;
      try {
        const data = await refreshSession();
        if (data) {
          const storedUser = getStoredUser();
          const accessToken = data?.accessToken ?? data?.AccessToken;
          if (accessToken) {
            const userFromState =
              storedUser ??
              (() => ({
                id: data.userId,
                userId: data.userId,
                email: data.email,
                displayName: data.userName ?? data.email,
                userName: data.userName,
              }))();
            setState({ user: { ...userFromState, accessToken } });
          }
          scheduleProactiveRefresh();
        } else {
          setState({ user: null });
        }
      } catch {
        setState({ user: null });
      }
    }, delay);
  }, [clearRefreshTimer, setState]);

  const checkUserSession = useCallback(async () => {
    if (typeof window === 'undefined') {
      setState({ user: null, loading: false });
      return;
    }

    migrateSessionStorageAuth();

    try {
      const accessToken = getAccessToken();

      if (accessToken && isValidToken(accessToken)) {
        const user = getStoredUser();
        setState({
          user: user ? { ...user, accessToken } : null,
          loading: false,
        });
        scheduleProactiveRefresh();
        return;
      }

      const refreshToken = getRefreshToken();
      if (refreshToken?.trim()) {
        try {
          const data = await refreshSession();
          if (data) {
            const storedUser = getStoredUser();
            const newAccessToken = data?.accessToken ?? data?.AccessToken;
            if (newAccessToken) {
              const userFromState =
                storedUser ??
                (() => ({
                  id: data.userId,
                  userId: data.userId,
                  email: data.email,
                  displayName: data.userName ?? data.email,
                  userName: data.userName,
                }))();
              setState({ user: { ...userFromState, accessToken: newAccessToken }, loading: false });
            } else {
              setState({ user: null, loading: false });
            }
            scheduleProactiveRefresh();
            return;
          }
        } catch {
          setState({ user: null, loading: false });
          return;
        }
      }

      clearSession();
      setState({ user: null, loading: false });
    } catch (error) {
      console.error(error);
      setState({ user: null, loading: false });
    }
  }, [setState, scheduleProactiveRefresh]);

  useEffect(() => {
    checkUserSession();
    return clearRefreshTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';
  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, state.user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
