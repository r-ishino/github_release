'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'github-release-favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as string[];
        setFavorites(new Set(parsed));
      } catch {
        // ignore parse error
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
    }
  }, [favorites, isLoaded]);

  const toggleFavorite = (repoFullName: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(repoFullName)) {
        next.delete(repoFullName);
      } else {
        next.add(repoFullName);
      }
      return next;
    });
  };

  const isFavorite = (repoFullName: string): boolean => {
    return favorites.has(repoFullName);
  };

  return { favorites, toggleFavorite, isFavorite, isLoaded };
};
