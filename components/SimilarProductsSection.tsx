'use client';

import React, { useEffect, useState } from 'react';
import { useRecommendations } from '@/lib/hooks/useRecommendations';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Bookmark, ShoppingCart, RefreshCw } from 'lucide-react';
import { useActivityTracking } from '@/lib/hooks/useRecommendations';
import Link from 'next/link';
import { formatPrice } from '@/lib/helpers';

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
  const { recommendations, isLoading, error, refresh, fetchSimilarProducts } = useRecommendations(limit);
  const { trackActivity } = useActivityTracking();
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (productId && !hasFetched) {
      fetchSimilarProducts(productId, limit);
      setHasFetched(true);
    }
  }, [productId, fetchSimilarProducts, limit, hasFetched]);

  const handleViewContent = (productId: string, title: string, subject: string, contentType: string) => {
    trackActivity('view', productId, {
      subject,
      contentType,
      difficulty: 'intermediate',
    });
    // Navigation will happen via Link component
  };

  const handleBookmark = (productId: string, title: string, subject: string) => {
    trackActivity('bookmark', productId, {
      subject,
      contentType: 'course',
    });
    // Add to wishlist logic here
    alert(`Added "${title}" to bookmarks`);
  };

  const handleAddToCart = (productId: string, title: string, subject: string) => {
    trackActivity('cart', productId, {
      subject,
      contentType: 'course',
    });
    // Add to cart logic here
    alert(`Added "${title}" to cart`);
  };

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((product) => (
          <Card key={product.productId} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base font-bold line-clamp-1">
                    <Link 
                      href={`/products/${product.productId}`}
                      onClick={() => handleViewContent(product.productId, product.title, product.subject, product.contentType)}
                      className="hover:text-primary"
                    >
                      {product.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {product.subject} • {product.contentType}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  {product.difficulty}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 pt-0">
              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-bold text-primary">
                  {formatPrice(product.price)}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                    Match: {Math.round(product.score)}%
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {product.reason}
              </p>
            </CardContent>
            
            <CardFooter className="p-4 pt-0 flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => handleViewContent(product.productId, product.title, product.subject, product.contentType)}
                asChild
              >
                <Link href={`/products/${product.productId}`}>
                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                  View
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBookmark(product.productId, product.title, product.subject)}
              >
                <Bookmark className="w-3.5 h-3.5" />
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => handleAddToCart(product.productId, product.title, product.subject)}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}