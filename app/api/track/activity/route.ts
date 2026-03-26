import { NextRequest, NextResponse } from 'next/server';
import { RecommendationService } from '@/lib/services/recommendationService';
import { verifyAccessToken } from '@/lib/services/tokenService';

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
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
    
    const {
      action,
      contentId,
      subject,
      contentType,
      difficulty,
      priceRange,
      searchQuery
    } = body;
    
    // Validate required fields
    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }
    
    // Validate action type
    const validActions = ['view', 'bookmark', 'cart', 'purchase', 'enroll', 'search'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
    
    // Track the activity
    await RecommendationService.trackUserActivity(
      userId,
      action as any,
      contentId,
      {
        subject,
        contentType,
        difficulty,
        priceRange,
        searchQuery
      }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Activity tracked successfully'
    });
    
  } catch (error) {
    console.error('Error tracking activity:', error);
    return NextResponse.json(
      { error: 'Failed to track activity' },
      { status: 500 }
    );
  }
}