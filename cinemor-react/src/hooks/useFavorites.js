import { useState, useEffect, useCallback } from 'react';
import { getAuthHeader, getIsTokenValid } from '@/helpers/auth-helper';
import { useAuth } from '@/context/AuthContext';
import {
  FAVORITE_IDS_API_ROUTE,
  ADD_FAVORITE_API_ROUTE,
  REMOVE_FAVORITE_API_ROUTE,
} from '@/helpers/api-routes';
import { logError } from '@/helpers/logger';


export function useFavorites(user) {
  const { logout } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(!!user);

  const refresh = useCallback(async () => {
    const token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('token') : null;
    if (!user || !token || !getIsTokenValid(token)) {
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(FAVORITE_IDS_API_ROUTE, { headers: getAuthHeader() });
      if (res.status === 401 || res.status === 403) {
        if (res.status === 401) logout();
        setFavoriteIds(new Set());
        return;
      }
      if (res.ok) {
        const ids = await res.json();
        setFavoriteIds(new Set(Array.isArray(ids) ? ids : []));
      } else {
        setFavoriteIds(new Set());
      }
    } catch (err) {
      logError("useFavorites.refresh", err);
      setFavoriteIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [user, logout]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addFavorite = useCallback(
    async (movieId) => {
      if (!user || !movieId) return false;
      try {
        const res = await fetch(ADD_FAVORITE_API_ROUTE, {
          method: 'POST',
          headers: getAuthHeader(),
          body: JSON.stringify({ movieId }),
        });
        if (res.status === 401) {
          logout();
          return false;
        }
        if (res.ok || res.status === 201) {
          setFavoriteIds((prev) => new Set([...prev, Number(movieId)]));
          return true;
        }
      } catch (err) {
        logError("useFavorites.addFavorite", err);
      }
      return false;
    },
    [user, logout]
  );

  const removeFavorite = useCallback(
    async (movieId) => {
      if (!user || !movieId) return false;
      try {
        const res = await fetch(REMOVE_FAVORITE_API_ROUTE(movieId), {
          method: 'DELETE',
          headers: getAuthHeader(),
        });
        if (res.status === 401) {
          logout();
          return false;
        }
        if (res.ok || res.status === 204) {
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            next.delete(Number(movieId));
            return next;
          });
          return true;
        }
      } catch (err) {
        logError("useFavorites.removeFavorite", err);
      }
      return false;
    },
    [user, logout]
  );

  const toggleFavorite = useCallback(
    async (movieId) => {
      if (!user) return false;
      const id = Number(movieId);
      const isFav = favoriteIds.has(id);
      if (isFav) return removeFavorite(movieId);
      return addFavorite(movieId);
    },
    [user, favoriteIds, addFavorite, removeFavorite]
  );

  const isFavorite = useCallback(
    (movieId) => (movieId != null ? favoriteIds.has(Number(movieId)) : false),
    [favoriteIds]
  );

  return {
    favoriteIds,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    refresh,
    loading,
  };
}
