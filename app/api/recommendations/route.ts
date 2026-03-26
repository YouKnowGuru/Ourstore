import { NextRequest, NextResponse } from 'next/server';
import { RecommendationService } from '@/lib/services/recommendationService';
import { verifyAccessToken } from '@/lib/services/tokenService';

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '12');
    const productId = searchParams.get('productId');
    
    // If productId is provided, get similar products
    if (productId) {
      const similarProducts = await RecommendationService.getSimilarProducts(productId, limit);
      return NextResponse.json({
        recommendations: similarProducts,
        source: 'similar_products',
        productId,
        message: 'Similar products you may also like'
      });
    }
    
    let userId: string | null = null;
    
    // Try to get user ID from token if provided
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = verifyAccessToken(token);
      if (payload?.userId) {
        userId = payload.userId;
      }
    }
    
    // If no user ID, we can still provide generic recommendations
    if (!userId) {
      // Return cold start recommendations for anonymous users
      const recommendations = await RecommendationService.getRecommendationsForUser('anonymous', limit);
      return NextResponse.json({
        recommendations,
        source: 'anonymous_cold_start',
        message: 'Popular content for new users'
      });
    }
    
    // Get personalized recommendations for authenticated user
    const recommendations = await RecommendationService.getRecommendationsForUser(userId, limit);

    return NextResponse.json({
      recommendations,
      source: 'personalized',
      userId,
      message: 'Personalized recommendations based on your activity'
    });
    
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // This endpoint can be used to refresh recommendations or apply filters
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    
    if (!payload?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }
    
    const userId = payload.userId;
    const body = await request.json();
    const { filters, limit = 12 } = body;
    
    // Get recommendations with optional filters
    const recommendations = await RecommendationService.getRecommendationsForUser(userId, limit);
    
    // Apply additional filters if provided
    let filteredRecommendations = recommendations;
    
    if (filters) {
      if (filters.subject) {
        filteredRecommendations = filteredRecommendations.filter(
          rec => rec.subject === filters.subject
        );
      }
      if (filters.contentType) {
        filteredRecommendations = filteredRecommendations.filter(
          rec => rec.contentType === filters.contentType
        );
      }
      if (filters.difficulty) {
        filteredRecommendations = filteredRecommendations.filter(
          rec => rec.difficulty === filters.difficulty
        );
      }
      if (filters.maxPrice) {
        filteredRecommendations = filteredRecommendations.filter(
          rec => rec.price <= filters.maxPrice
        );
      }
    }
    
    return NextResponse.json({
      recommendations: filteredRecommendations,
      source: 'personalized_filtered',
      userId,
      filtersApplied: filters || {},
      message: 'Filtered recommendations based on your preferences'
    });
    
  } catch (error) {
    console.error('Error getting filtered recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get filtered recommendations' },
      { status: 500 }
    );
  }
}