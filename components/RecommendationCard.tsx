'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Bookmark, ShoppingCart, Star } from 'lucide-react';
import { useActivityTracking } from '@/lib/hooks/useRecommendations';

export interface RecommendationCardProps {
  recommendation: {
    productId: string;
    title: string;
    subject: string;
    contentType: string;
    difficulty: string;
    price: number;
    score: number;
    reason: string;
  };
  compact?: boolean;
  showActions?: boolean;
}

export function RecommendationCard({ 
  recommendation, 
  compact = false,
  showActions = true 
}: RecommendationCardProps) {
  const { trackActivity } = useActivityTracking();
  
  const {
    productId,
    title,
    subject,
    contentType,
    difficulty,
    price,
    score,
    reason
  } = recommendation;

  const handleView = () => {
    trackActivity('view', productId, {
      subject,
      contentType,
      difficulty,
    });
    window.location.href = `/products/${productId}`;
  };

  const handleBookmark = () => {
    trackActivity('bookmark', productId, {
      subject,
      contentType,
    });
    // Implement bookmark logic
  };

  const handleAddToCart = () => {
    trackActivity('cart', productId, {
      subject,
      contentType,
    });
    // Implement add to cart logic
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'course': return '📚';
      case 'pdf': return '📄';
      case 'video': return '🎬';
      case 'quiz': return '📝';
      case 'material': return '📦';
      default: return '📖';
    }
  };

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleView}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium line-clamp-2">{title}</h4>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className={`text-xs ${getDifficultyColor(difficulty)}`}>
                  {difficulty}
                </Badge>
                <span className="text-sm text-muted-foreground">{subject}</span>
              </div>
            </div>
            <div className="ml-4 text-right">
              <div className="text-lg font-bold">${price}</div>
              <div className="text-xs text-muted-foreground flex items-center justify-end mt-1">
                <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                {Math.round(score)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
            <CardDescription className="mt-2 flex items-center gap-2">
              <span className="font-medium">{subject}</span>
              <span>•</span>
              <span>{getContentTypeIcon(contentType)} {contentType}</span>
            </CardDescription>
          </div>
          <Badge variant="outline" className={`ml-2 ${getDifficultyColor(difficulty)}`}>
            {difficulty}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3 flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {reason}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">${price}</span>
            {score > 70 && (
              <Badge variant="default" className="text-xs">
                🔥 Top Pick
              </Badge>
            )}
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
            <span>Match: {Math.round(score)}%</span>
          </div>
        </div>
      </CardContent>
      
      {showActions && (
        <CardFooter className="pt-3 border-t">
          <div className="flex justify-between w-full">
            <Button
              size="sm"
              variant="outline"
              onClick={handleView}
              className="flex-1 mr-2"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleBookmark}
                className="px-3"
              >
                <Bookmark className="w-4 h-4" />
              </Button>
              
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="px-3"
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}