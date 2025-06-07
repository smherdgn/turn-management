
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth(redirectTo = '/login') {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true; // To prevent state updates on unmounted component

    async function checkAuthStatus() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/me'); // This API route is protected by middleware
        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            if (data.authenticated) {
              setIsAuthenticated(true);
            } else {
              setIsAuthenticated(false);
              router.replace(redirectTo);
            }
          }
        } else { // Non-OK response (e.g., 401 from middleware if token invalid/missing, or 500)
          if (isMounted) {
            setIsAuthenticated(false);
            router.replace(redirectTo);
          }
        }
      } catch (error) {
        console.error('Authentication check failed in useAuth hook:', error);
        if (isMounted) {
          setIsAuthenticated(false);
          router.replace(redirectTo);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkAuthStatus();

    return () => {
      isMounted = false;
    };
  }, [router, redirectTo]);

  return { isAuthenticated, isLoading };
}
