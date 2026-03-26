# TeachStore User Behavior Tracking & Recommendation System

## Overview
A production-ready, rule-based recommendation system for the Teacher Marketplace Platform ("TeachStore") that tracks user behavior and provides personalized content recommendations without using AI/ML.

## System Architecture

### 1. MongoDB Schemas

#### UserActivity Schema (`lib/models/UserActivity.ts`)
Tracks all user interactions:
- **Content Interactions**: `viewedContent`, `bookmarked`, `cart`, `purchased`, `enrolled`
- **Context Data**: `subjects`, `contentTypes`, `difficultyLevels`, `priceRanges`
- **Search Behavior**: `searchQueries`
- **Time Tracking**: `lastViewedAt`, `createdAt`, `updatedAt`

#### Enhanced Product Schema (`lib/models/Product.ts`)
Extended with recommendation fields:
- `subject`: Math, Science, English, etc.
- `contentType`: course, pdf, video, quiz, material
- `difficulty`: beginner, intermediate, advanced
- `enrollments`, `views`, `bookmarks`: Engagement metrics
- `salesCount`: Popularity metric

### 2. Rule-Based Recommendation Engine (`lib/services/recommendationService.ts`)

#### Scoring Algorithm
```
score = 
  viewed * 1 +
  bookmarked * 3 + 
  cart * 4 +
  enrolled * 5 +
  purchased * 6
```

#### Recommendation Rules
1. **Subject Match**: Content matching user's interested subjects
2. **Content Type Preference**: Based on user's preferred formats
3. **Difficulty Level**: Matches user's comfort level
4. **Popularity Boost**: Higher enrollments/views increase score
5. **Recency Boost**: Recently viewed content gets priority
6. **Cold Start**: For new users, show most popular content

#### Cold Start Handling
When user has no activity:
- Show most purchased content
- Trending subjects
- Latest uploads
- Featured courses

### 3. API Endpoints

#### Activity Tracking (`POST /api/track/activity`)
```json
{
  "action": "view|bookmark|cart|purchase|enroll|search",
  "contentId": "product_id",
  "subject": "Math",
  "contentType": "course",
  "difficulty": "beginner",
  "searchQuery": "algebra basics"
}
```

#### Recommendations (`GET /api/recommendations`)
- **Authenticated**: Personalized recommendations based on user activity
- **Anonymous**: Cold start recommendations (popular content)
- **Query Params**: `?limit=12` (default)

#### Filtered Recommendations (`POST /api/recommendations`)
```json
{
  "filters": {
    "subject": "Math",
    "contentType": "course",
    "difficulty": "beginner",
    "maxPrice": 50
  },
  "limit": 12
}
```

### 4. Frontend Components

#### `RecommendationSection` (`components/RecommendationSection.tsx`)
Main component displaying personalized recommendations with:
- Real-time filtering by subject, content type, difficulty
- Activity tracking on user interactions
- Loading states and error handling
- Responsive grid layout

#### `RecommendationCard` (`components/RecommendationCard.tsx`)
Individual recommendation card showing:
- Content title, subject, type, difficulty
- Match score and reasoning
- Price and action buttons
- Compact and detailed view modes

#### `useRecommendations` Hook (`lib/hooks/useRecommendations.ts`)
React hook for fetching and managing recommendations:
- Automatic fetching based on user authentication
- Filter management
- Refresh capability
- Loading and error states

#### `useActivityTracking` Hook
Utility for tracking user activities:
- View, bookmark, cart, purchase, enroll actions
- Automatic token handling
- Error resilience

### 5. Integration Points

#### Home Page Integration (`app/(main)/page.tsx`)
Added "Recommended for You" section after featured products:
- Personalized recommendations for logged-in users
- Popular content for anonymous users
- Real-time filtering options

#### Product Page Integration
Automatic tracking when users:
- View product details
- Add to cart or wishlist
- Make purchases
- Bookmark content

### 6. System Flow

```
User Activity → Track → Store in MongoDB → Apply Rules → Score & Rank → Display
     ↑                                                            ↓
     └─────────────────── Feedback Loop ──────────────────────────┘
```

### 7. Key Features

✅ **Real-time Tracking**: Every user interaction is captured  
✅ **Rule-based Logic**: Pure JavaScript logic, no AI/ML dependencies  
✅ **Dynamic Recommendations**: Based on actual user behavior  
✅ **Cold Start Handling**: Smart defaults for new users  
✅ **Performance Optimized**: Indexed queries, efficient scoring  
✅ **Scalable Architecture**: Modular components, clean separation  
✅ **Production Ready**: Error handling, logging, validation  

### 8. Deployment Notes

#### Environment Variables
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

#### Database Indexes
- `UserActivity.userId`: For fast user lookup
- `UserActivity.subjects`: For subject-based queries  
- `UserActivity.contentTypes`: For content type filtering
- `Product.subject`: For subject-based recommendations
- `Product.contentType`: For content type filtering
- `Product.difficulty`: For difficulty-based filtering

#### Performance Considerations
- Recommendations are cached at API level
- Database queries use efficient indexes
- Scoring happens in-memory for speed
- Pagination limits data transfer

### 9. Future Enhancements

1. **A/B Testing**: Test different recommendation algorithms
2. **Seasonal Trends**: Boost seasonal/holiday content
3. **Collaborative Filtering**: "Users who liked X also liked Y"
4. **Performance Analytics**: Track recommendation effectiveness
5. **Admin Dashboard**: View recommendation metrics and trends

### 10. Compliance & Privacy

- All tracking is opt-in (implied by using the platform)
- Users can clear their activity data
- No personally identifiable information in recommendation logic
- GDPR-compliant data handling

---

## Quick Start

1. **Install Dependencies**: Already included in existing project
2. **Database Setup**: MongoDB with required collections
3. **Environment Setup**: Configure `.env.local` with MongoDB URI
4. **Run Development Server**: `npm run dev`
5. **Test System**: Visit homepage to see recommendations

The system is now fully integrated into the TeachStore platform and ready for production use.