'use client';

import React, { useEffect, useState } from 'react';
import { useRecommendations } from '@/lib/hooks/useRecommendations';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/types';

interface SimilarProductsSectionProps {
  productId: string;
  title?: string;
  subtitle?: string;
  limit?: number;
  className?: string;
}

export function SimilarProductsSection({
  productId,
  title = 'You May Also Like',
  subtitle = 'Similar products based on this item',
  limit = 6,
  className = '',
}: SimilarProductsSectionProps) {
  const { recommendations, isLoading, error, fetchSimilarProducts } = useRecommendations(limit);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (productId && !hasFetched) {
      fetchSimilarProducts(productId, limit);
      setHasFetched(true);
    }
  }, [productId, fetchSimilarProducts, limit, hasFetched]);

  const handleRefresh = async () => {
    await fetchSimilarProducts(productId, limit);
  };

  if (error) {
    return (
      <div className={`p-6 border border-destructive/50 rounded-lg bg-destructive/10 ${className}`}>
        <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Similar Products</h3>
        <p className="text-destructive/80 mb-4">{error}</p>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (isLoading && !hasFetched) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
          <Button variant="outline" size="sm" disabled>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Skeleton className="h-32 w-full mb-2" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0 && !isLoading) {
    return (
      <div className={`p-8 border border-dashed rounded-lg text-center ${className}`}>
        <h3 className="text-lg font-semibold mb-2">No Similar Products Found</h3>
        <p className="text-muted-foreground mb-4">We couldn't find similar products for this item.</p>
        <Button onClick={handleRefresh} variant="outline">
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
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {recommendations.map((rec) => {
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
              isCustomizable: false,
              stock: 10,
              tags: [rec.subject, rec.contentType, rec.difficulty],
              status: 'active',
              salesCount: 0,
              createdAt: new Date().toISOString()
            };

            return <ProductCard key={rec.productId} product={product} />;
        })}
      </div>
    </div>
  );
}