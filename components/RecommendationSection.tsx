'use client';

import React from 'react';
import { useRecommendations, useActivityTracking } from '@/lib/hooks/useRecommendations';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Filter, RefreshCw, Eye, Bookmark, ShoppingCart, Star } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/helpers';

interface RecommendationSectionProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  showFilters?: boolean;
  className?: string;
}

export function RecommendationSection({
  title = 'Recommended for You',
  subtitle = 'Personalized content based on your activity',
  limit = 6,
  showFilters = true,
  className = '',
}: RecommendationSectionProps) {
  const { recommendations, isLoading, error, refresh, filters, setFilters } = useRecommendations(limit);
  const { trackActivity } = useActivityTracking();

  const handleViewContent = (productId: string, title: string, subject: string, contentType: string) => {
    trackActivity('view', productId, {
      subject,
      contentType,
      difficulty: 'intermediate', // This would come from product data
    });
    // Navigate to product page or open modal
    window.location.href = `/products/${productId}`;
  };

  const handleBookmark = (productId: string, title: string, subject: string) => {
    trackActivity('bookmark', productId, {
      subject,
      contentType: 'course', // This would come from product data
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

  const subjects = ['Math', 'Science', 'English', 'History', 'Physics', 'Chemistry', 'Biology'];
  const contentTypes = ['course', 'pdf', 'video', 'quiz', 'material'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

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
          
          {showFilters && (
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Subject:</span>
            <select 
              className="text-sm border rounded px-2 py-1"
              value={filters.subject || ''}
              onChange={(e) => setFilters({ ...filters, subject: e.target.value || undefined })}
            >
              <option value="">All</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Type:</span>
            <select 
              className="text-sm border rounded px-2 py-1"
              value={filters.contentType || ''}
              onChange={(e) => setFilters({ ...filters, contentType: e.target.value || undefined })}
            >
              <option value="">All</option>
              {contentTypes.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Difficulty:</span>
            <select 
              className="text-sm border rounded px-2 py-1"
              value={filters.difficulty || ''}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value || undefined })}
            >
              <option value="">All</option>
              {difficulties.map(diff => (
                <option key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
              ))}
            </select>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setFilters({})}
            className="text-xs"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
           <Card key={rec.productId} className="overflow-hidden hover:shadow-lg transition-shadow group">
             {/* Product Image */}
             <div className="relative h-48 overflow-hidden bg-gray-100">
               {rec.images && rec.images.length > 0 ? (
                 <img
                   src={rec.images[0]}
                   alt={rec.title}
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                 />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                   <div className="text-gray-400 text-center p-4">
                     <div className="text-lg font-medium">No Image</div>
                     <div className="text-sm">{rec.subject}</div>
                   </div>
                 </div>
               )}
               {rec.isFeatured && (
                 <Badge className="absolute top-2 left-2 bg-amber-500 hover:bg-amber-600">
                   Featured
                 </Badge>
               )}
               <Badge className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm">
                 {Math.round(rec.score)}% Match
               </Badge>
             </div>
             
             <CardHeader className="pb-3">
               <div className="flex justify-between items-start">
                 <div className="flex-1">
                   <CardTitle className="text-lg line-clamp-2">
                     <Link
                       href={`/products/${rec.productId}`}
                       onClick={() => handleViewContent(rec.productId, rec.title, rec.subject, rec.contentType)}
                       className="hover:text-primary transition-colors"
                     >
                       {rec.title}
                     </Link>
                   </CardTitle>
                   <CardDescription className="mt-1 flex items-center gap-2">
                     <span className="font-medium">{rec.subject}</span>
                     <span className="text-gray-300">•</span>
                     <span className="capitalize">{rec.contentType}</span>
                     {rec.ratings?.average > 0 && (
                       <>
                         <span className="text-gray-300">•</span>
                         <span className="flex items-center gap-1">
                           <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                           <span className="text-xs">{rec.ratings.average.toFixed(1)}</span>
                           <span className="text-xs text-gray-400">({rec.ratings.count})</span>
                         </span>
                       </>
                     )}
                   </CardDescription>
                 </div>
                 <Badge variant={rec.difficulty === 'advanced' ? 'destructive' : rec.difficulty === 'intermediate' ? 'default' : 'secondary'}>
                   {rec.difficulty}
                 </Badge>
               </div>
             </CardHeader>
             
             <CardContent className="pb-3">
               <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                 {rec.reason}
               </p>
               
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <div className="flex flex-col">
                     <div className="flex items-center gap-2">
                       <span className="text-2xl font-bold text-gray-900">
                         {formatPrice(rec.discountPrice || rec.price)}
                       </span>
                       {rec.discountPrice && rec.discountPrice < rec.price && (
                         <>
                           <span className="text-sm text-gray-500 line-through">
                             {formatPrice(rec.price)}
                           </span>
                           <Badge variant="destructive" className="text-xs">
                             Save {Math.round((1 - rec.discountPrice / rec.price) * 100)}%
                           </Badge>
                         </>
                       )}
                     </div>
                     <div className="text-xs text-gray-500">
                       {rec.category}
                     </div>
                   </div>
                 </div>
                 
                 <div className="text-xs text-muted-foreground">
                   {rec.score > 70 ? '🔥 Perfect Match' : rec.score > 50 ? '👍 Good Match' : '🤔 May Interest You'}
                 </div>
               </div>
             </CardContent>
             
             <CardFooter className="pt-3 border-t flex flex-col gap-2">
               <div className="flex justify-between w-full">
                 <Button
                   size="sm"
                   variant="outline"
                   onClick={() => handleViewContent(rec.productId, rec.title, rec.subject, rec.contentType)}
                   asChild
                   className="flex-1"
                 >
                   <Link href={`/products/${rec.productId}`}>
                     <Eye className="w-4 h-4 mr-2" />
                     View Details
                   </Link>
                 </Button>
                 
                 <div className="flex gap-2">
                   <Button
                     size="sm"
                     variant="ghost"
                     onClick={() => handleBookmark(rec.productId, rec.title, rec.subject)}
                     className="h-10 w-10 p-0"
                   >
                     <Bookmark className="w-4 h-4" />
                   </Button>
                   
                   <Button
                     size="sm"
                     onClick={() => handleAddToCart(rec.productId, rec.title, rec.subject)}
                     className="h-10"
                   >
                     <ShoppingCart className="w-4 h-4 mr-2" />
                     Add to Cart
                   </Button>
                 </div>
               </div>
             </CardFooter>
           </Card>
          ))}
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