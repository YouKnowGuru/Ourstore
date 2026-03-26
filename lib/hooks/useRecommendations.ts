import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface Recommendation {
  productId: string;
  title: string;
  description?: string;
  subject: string;
  contentType: string;
  difficulty: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string;
  ratings: {
    average: number;
    count: number;
  };
  isFeatured: boolean;
  score: number;
  reason: string;
}

export interface UseRecommendationsResult {
  recommendations: Recommendation[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  filters: RecommendationFilters;
  setFilters: (filters: RecommendationFilters) => void;
  fetchSimilarProducts: (productId: string, limit?: number) => Promise<Recommendation[]>;
}

export interface RecommendationFilters {
  subject?: string;
  contentType?: string;
  difficulty?: string;
  maxPrice?: number;
}

export function useRecommendations(initialLimit: number = 12) {
  const { user, isAuthenticated } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RecommendationFilters>({});

  const fetchRecommendations = useCallback(async (customFilters?: RecommendationFilters) => {
    try {
      setIsLoading(true);
      setError(null);

      const appliedFilters = customFilters || filters;
      const hasFilters = Object.keys(appliedFilters).length > 0;

      let url = `/api/recommendations?limit=${initialLimit}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let response;
      
      if (hasFilters) {
        // Use POST for filtered recommendations
        response = await fetch('/api/recommendations', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            filters: appliedFilters,
            limit: initialLimit
          }),
        });
      } else {
        // Use GET for basic recommendations
        response = await fetch(url, { headers });
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.status}`);
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  }, [initialLimit, filters]);

  const fetchSimilarProducts = useCallback(async (productId: string, limit: number = 6) => {
    try {
      setIsLoading(true);
      setError(null);

      const url = `/api/recommendations?productId=${productId}&limit=${limit}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`Failed to fetch similar products: ${response.status}`);
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
      return data.recommendations || [];
    } catch (err) {
      console.error('Error fetching similar products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load similar products');
      setRecommendations([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const refresh = async () => {
    await fetchRecommendations();
  };

  const applyFilters = (newFilters: RecommendationFilters) => {
    setFilters(newFilters);
    fetchRecommendations(newFilters);
  };

  return {
    recommendations,
    isLoading,
    error,
    refresh,
    filters,
    setFilters: applyFilters,
    fetchSimilarProducts,
  };
}

// Hook for tracking user activity
export function useActivityTracking() {
  const trackActivity = async (
    action: 'view' | 'bookmark' | 'cart' | 'purchase' | 'enroll' | 'search',
    contentId?: string,
    metadata?: {
      subject?: string;
      contentType?: string;
      difficulty?: string;
      priceRange?: string;
      searchQuery?: string;
    }
  ) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        // Don't track for anonymous users (or track anonymously if needed)
        return;
      }

      const response = await fetch('/api/track/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          contentId,
          ...metadata,
        }),
      });

      if (!response.ok) {
        console.warn('Failed to track activity:', response.status);
      }
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };

  return { trackActivity };
}