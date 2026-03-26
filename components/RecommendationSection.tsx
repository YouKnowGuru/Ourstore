'use client';

import React from 'react';
import { useRecommendations } from '@/lib/hooks/useRecommendations';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/types';

interface RecommendationSectionProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  className?: string;
}

export function RecommendationSection({
  title = 'Recommended for You',
  subtitle = 'Personalized content based on your activity',
  limit = 6,
  className = '',
}: RecommendationSectionProps) {
  const { recommendations, isLoading, error, refresh } = useRecommendations(limit);

  if (error) {
    return (
      <div className={`p-6 border border-destructive/50 rounded-lg bg-destructive/10 ${className}`}>
        <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Recommendations</h3>
        <p className="text-destructive/80 mb-4">{error}</p>
        <Button onClick={refresh} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={refresh} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-4/6" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {recommendations.map((rec) => {
            // Map Recommendation to Product type
            const product: Product = {
              _id: rec.productId,
              title: rec.title,
              description: rec.description || rec.reason || '',
              price: rec.price,
              discountPrice: rec.discountPrice,
              images: rec.images,
              category: rec.category,
              isFeatured: rec.isFeatured,
              ratings: rec.ratings,
              isCustomizable: false, // Default since Recommendation doesn't have it
              stock: 10, // Default since Recommendation doesn't have it
              tags: [rec.subject, rec.contentType, rec.difficulty],
              status: 'active',
              salesCount: 0,
              createdAt: new Date().toISOString()
            };

            return <ProductCard key={rec.productId} product={product} />;
          })}
        </div>
      ) : (
        <Card className="text-center p-12">
          <CardContent className="space-y-4">
            <h3 className="text-xl font-semibold">No recommendations found</h3>
            <p className="text-muted-foreground">
              Start browsing content to get personalized recommendations!
            </p>
            <Button onClick={() => window.location.href = '/products'}>
              Browse Content
            </Button>
          </CardContent>
        </Card>
      )}
      
      {recommendations.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          <p>Recommendations are updated in real-time based on your activity</p>
        </div>
      )}
    </div>
  );
}