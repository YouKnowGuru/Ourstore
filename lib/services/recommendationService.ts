import { UserActivity } from '@/lib/models/UserActivity';
import Product from '@/lib/models/Product';
import connectDB from '@/lib/mongodb';

export interface RecommendationResult {
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

export class RecommendationService {
  /**
   * Get recommendations for a user based on their activity
   */
  static async getRecommendationsForUser(userId: string, limit: number = 12): Promise<RecommendationResult[]> {
    await connectDB();
    
    // Get user activity
    const userActivity = await UserActivity.findOne({ userId });
    
    // If no activity, return cold start recommendations
    if (!userActivity || this.isColdStart(userActivity)) {
      return this.getColdStartRecommendations(limit);
    }
    
    // Get rule-based recommendations
    const recommendations = await this.getRuleBasedRecommendations(userActivity, limit);
    
    return recommendations;
  }
  
  /**
   * Check if user has minimal activity (cold start)
   */
  private static isColdStart(userActivity: any): boolean {
    return (
      userActivity.viewedContent.length === 0 &&
      userActivity.bookmarked.length === 0 &&
      userActivity.cart.length === 0 &&
      userActivity.purchased.length === 0 &&
      userActivity.enrolled.length === 0
    );
  }
  
  /**
   * Cold start: show popular content for new users
   */
  private static async getColdStartRecommendations(limit: number): Promise<RecommendationResult[]> {
    const products = await Product.find({ status: 'active' })
      .sort({ 
        salesCount: -1, 
        enrollments: -1,
        views: -1 
      })
      .limit(limit);
    
    return products.map(product => ({
      productId: product._id.toString(),
      title: product.title,
      description: product.description,
      subject: product.subject,
      contentType: product.contentType,
      difficulty: product.difficulty,
      price: product.discountPrice || product.price,
      discountPrice: product.discountPrice,
      images: product.images || [],
      category: product.category,
      ratings: product.ratings || { average: 0, count: 0 },
      isFeatured: product.isFeatured || false,
      score: this.calculateColdStartScore(product),
      reason: 'Popular among all users'
    }));
  }
  
  /**
   * Rule-based recommendation engine
   */
  private static async getRuleBasedRecommendations(userActivity: any, limit: number): Promise<RecommendationResult[]> {
    const userId = userActivity.userId;
    
    // Get all products that match user's preferences
    const query: any = {
      status: 'active',
      _id: { $nin: [...userActivity.purchased, ...userActivity.enrolled] }
    };
    
    // Apply filters based on user's interests
    if (userActivity.subjects.length > 0) {
      query.subject = { $in: userActivity.subjects };
    }
    
    if (userActivity.contentTypes.length > 0) {
      query.contentType = { $in: userActivity.contentTypes };
    }
    
    if (userActivity.difficultyLevels.length > 0) {
      query.difficulty = { $in: userActivity.difficultyLevels };
    }
    
    // Get candidate products
    const products = await Product.find(query).limit(limit * 2); // Get more for scoring
    
    // Score each product
    const scoredProducts = products.map(product => {
      const score = this.calculateProductScore(product, userActivity);
      return {
        product,
        score
      };
    });
    
    // Sort by score descending
    scoredProducts.sort((a, b) => b.score - a.score);
    
    // Take top N
    const topProducts = scoredProducts.slice(0, limit);
    
    return topProducts.map(({ product, score }) => ({
      productId: product._id.toString(),
      title: product.title,
      description: product.description,
      subject: product.subject,
      contentType: product.contentType,
      difficulty: product.difficulty,
      price: product.discountPrice || product.price,
      discountPrice: product.discountPrice,
      images: product.images || [],
      category: product.category,
      ratings: product.ratings || { average: 0, count: 0 },
      isFeatured: product.isFeatured || false,
      score,
      reason: this.getRecommendationReason(product, userActivity, score)
    }));
  }
  
  /**
   * Calculate product score based on user activity
   */
  private static calculateProductScore(product: any, userActivity: any): number {
    let score = 0;
    
    // Base popularity score
    score += product.enrollments * 0.1;
    score += product.views * 0.01;
    score += product.bookmarks * 0.05;
    score += product.salesCount * 0.2;
    
    // Match with user's interests
    if (userActivity.subjects.includes(product.subject)) {
      score += 10;
    }
    
    if (userActivity.contentTypes.includes(product.contentType)) {
      score += 8;
    }
    
    if (userActivity.difficultyLevels.includes(product.difficulty)) {
      score += 5;
    }
    
    // Boost if user has interacted with similar content
    if (userActivity.viewedContent.includes(product._id.toString())) {
      score += 15; // Recently viewed boost
    }
    
    if (userActivity.bookmarked.includes(product._id.toString())) {
      score += 25; // Bookmarked content
    }
    
    if (userActivity.cart.includes(product._id.toString())) {
      score += 30; // In cart
    }
    
    // Time-based decay for recently viewed
    const now = new Date();
    const lastViewed = userActivity.lastViewedAt;
    if (lastViewed) {
      const daysSinceLastView = (now.getTime() - lastViewed.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastView < 7) {
        score += 20; // Recent activity boost
      }
    }
    
    return score;
  }
  
  /**
   * Calculate cold start score
   */
  private static calculateColdStartScore(product: any): number {
    return (
      product.salesCount * 0.3 +
      product.enrollments * 0.25 +
      product.views * 0.15 +
      product.bookmarks * 0.1 +
      (product.isFeatured ? 20 : 0)
    );
  }
  
  /**
   * Generate human-readable reason for recommendation
   */
  private static getRecommendationReason(product: any, userActivity: any, score: number): string {
    const reasons = [];
    
    if (userActivity.subjects.includes(product.subject)) {
      reasons.push(`Matches your interest in ${product.subject}`);
    }
    
    if (userActivity.contentTypes.includes(product.contentType)) {
      reasons.push(`Similar to your preferred format (${product.contentType})`);
    }
    
    if (userActivity.viewedContent.includes(product._id.toString())) {
      reasons.push('You recently viewed this');
    }
    
    if (userActivity.bookmarked.includes(product._id.toString())) {
      reasons.push('You bookmarked this');
    }
    
    if (product.enrollments > 100) {
      reasons.push('Highly popular course');
    }
    
    if (reasons.length === 0) {
      return 'Recommended based on trending content';
    }
    
    return reasons.join(' • ');
  }
  
  /**
   * Get similar products based on a product's attributes
   */
  static async getSimilarProducts(
    productId: string,
    limit: number = 6
  ): Promise<RecommendationResult[]> {
    await connectDB();
    
    // Get the current product
    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      return [];
    }
    
    // Find similar products based on subject, contentType, and difficulty
    const query: any = {
      _id: { $ne: productId }, // Exclude current product
      status: 'active',
    };
    
    // Build similarity criteria
    const similarityCriteria = [];
    
    if (currentProduct.subject) {
      similarityCriteria.push({ subject: currentProduct.subject });
    }
    
    if (currentProduct.contentType) {
      similarityCriteria.push({ contentType: currentProduct.contentType });
    }
    
    if (currentProduct.difficulty) {
      similarityCriteria.push({ difficulty: currentProduct.difficulty });
    }
    
    // If we have similarity criteria, use $or to find similar products
    if (similarityCriteria.length > 0) {
      query.$or = similarityCriteria;
    } else {
      // Fallback: get popular products in same category
      const category = currentProduct.category || 'teaching';
      query.category = category;
    }
    
    // Get similar products
    const similarProducts = await Product.find(query)
      .sort({
        salesCount: -1,
        enrollments: -1,
        views: -1
      })
      .limit(limit * 2); // Get more for scoring
    
    // Score and rank similar products
    const scoredProducts = similarProducts.map(product => {
      let score = 0;
      
      // Subject match
      if (product.subject === currentProduct.subject) {
        score += 30;
      }
      
      // Content type match
      if (product.contentType === currentProduct.contentType) {
        score += 25;
      }
      
      // Difficulty match
      if (product.difficulty === currentProduct.difficulty) {
        score += 20;
      }
      
      // Category match
      if (product.category === currentProduct.category) {
        score += 15;
      }
      
      // Price similarity (within 20%)
      const currentPrice = currentProduct.discountPrice || currentProduct.price;
      const productPrice = product.discountPrice || product.price;
      const priceDiff = Math.abs(currentPrice - productPrice) / currentPrice;
      if (priceDiff <= 0.2) {
        score += 10;
      }
      
      // Popularity boost
      score += product.salesCount * 0.1;
      score += product.enrollments * 0.08;
      score += product.views * 0.05;
      
      return {
        productId: product._id.toString(),
        title: product.title,
        description: product.description,
        subject: product.subject,
        contentType: product.contentType,
        difficulty: product.difficulty,
        price: product.discountPrice || product.price,
        discountPrice: product.discountPrice,
        images: product.images || [],
        category: product.category,
        ratings: product.ratings || { average: 0, count: 0 },
        isFeatured: product.isFeatured || false,
        score,
        reason: this.getSimilarProductReason(product, currentProduct)
      };
    });
    
    // Sort by score and limit
    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
  
  /**
   * Generate reason for similar product recommendation
   */
  private static getSimilarProductReason(product: any, currentProduct: any): string {
    const reasons = [];
    
    if (product.subject === currentProduct.subject) {
      reasons.push(`Same subject (${product.subject})`);
    }
    
    if (product.contentType === currentProduct.contentType) {
      reasons.push(`Same format (${product.contentType})`);
    }
    
    if (product.difficulty === currentProduct.difficulty) {
      reasons.push(`Similar difficulty (${product.difficulty})`);
    }
    
    if (product.category === currentProduct.category) {
      reasons.push(`Same category`);
    }
    
    if (reasons.length === 0) {
      return 'Similar to what you\'re viewing';
    }
    
    return reasons.join(' • ');
  }

  /**
   * Track user activity
   */
  static async trackUserActivity(
    userId: string,
    action: 'view' | 'bookmark' | 'cart' | 'purchase' | 'enroll' | 'search',
    contentId?: string,
    metadata?: {
      subject?: string;
      contentType?: string;
      difficulty?: string;
      priceRange?: string;
      searchQuery?: string;
    }
  ) {
    await connectDB();
    
    // First, ensure user activity document exists
    let userActivity = await UserActivity.findOne({ userId });
    
    if (!userActivity) {
      userActivity = await UserActivity.create({
        userId,
        lastViewedAt: new Date()
      });
    }
    
    // Update last viewed time
    userActivity.lastViewedAt = new Date();
    
    // Add to appropriate array based on action
    if (contentId) {
      const contentIdStr = contentId.toString();
      
      switch (action) {
        case 'view':
          if (!userActivity.viewedContent.includes(contentIdStr)) {
            userActivity.viewedContent.push(contentIdStr);
          }
          // Update product views count
          await Product.findByIdAndUpdate(contentId, { $inc: { views: 1 } });
          break;
        case 'bookmark':
          if (!userActivity.bookmarked.includes(contentIdStr)) {
            userActivity.bookmarked.push(contentIdStr);
            // Update product bookmarks count
            await Product.findByIdAndUpdate(contentId, { $inc: { bookmarks: 1 } });
          }
          break;
        case 'cart':
          if (!userActivity.cart.includes(contentIdStr)) {
            userActivity.cart.push(contentIdStr);
          }
          break;
        case 'purchase':
          if (!userActivity.purchased.includes(contentIdStr)) {
            userActivity.purchased.push(contentIdStr);
            // Update product sales count
            await Product.findByIdAndUpdate(contentId, { $inc: { salesCount: 1 } });
          }
          break;
        case 'enroll':
          if (!userActivity.enrolled.includes(contentIdStr)) {
            userActivity.enrolled.push(contentIdStr);
            // Update product enrollments count
            await Product.findByIdAndUpdate(contentId, { $inc: { enrollments: 1 } });
          }
          break;
      }
    }
    
    // Add metadata to user's profile
    if (metadata) {
      if (metadata.subject && !userActivity.subjects.includes(metadata.subject)) {
        userActivity.subjects.push(metadata.subject);
      }
      if (metadata.contentType && !userActivity.contentTypes.includes(metadata.contentType)) {
        userActivity.contentTypes.push(metadata.contentType);
      }
      if (metadata.difficulty && !userActivity.difficultyLevels.includes(metadata.difficulty)) {
        userActivity.difficultyLevels.push(metadata.difficulty);
      }
      if (metadata.priceRange && !userActivity.priceRanges.includes(metadata.priceRange)) {
        userActivity.priceRanges.push(metadata.priceRange);
      }
      if (metadata.searchQuery && !userActivity.searchQueries.includes(metadata.searchQuery)) {
        userActivity.searchQueries.push(metadata.searchQuery);
      }
    }
    
    // Save the updated document
    await userActivity.save();
  }
}