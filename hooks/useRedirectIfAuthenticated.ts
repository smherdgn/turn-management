
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useRedirectIfAuthenticated(redirectTo = '/status') { // Default redirect to /status
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true; // To prevent state updates on unmounted component

    async function checkStatusAndRedirect() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/me');
        if (isMounted) {
          if (response.ok) {
            const data = await response.json();
            if (data.authenticated) {
              router.replace(redirectTo);
            }
            // If not authenticated, do nothing, stay on the current page (e.g., login page)
          }
          // If API call fails (e.g. network error, or 500), assume not authenticated and stay
        }
      } catch (error) {
        console.error('Auth check for redirect (useRedirectIfAuthenticated) failed:', error);
        // Stay on the current page
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    checkStatusAndRedirect();

    return () => {
      isMounted = false;
    };
  }, [router, redirectTo]);

  return { isLoading };
}
