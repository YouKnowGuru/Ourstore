import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserActivity extends Document {
  userId: string;
  
  // Content interactions
  viewedContent: string[];
  bookmarked: string[];
  cart: string[];
  purchased: string[];
  enrolled: string[];
  
  // Context data extracted from interacted content
  subjects: string[];
  contentTypes: string[];
  difficultyLevels: string[];
  priceRanges: string[];
  
  // Search behavior
  searchQueries: string[];
  
  // Time tracking
  lastViewedAt: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const userActivitySchema = new Schema<IUserActivity>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    
    viewedContent: [{
      type: String,
      default: [],
    }],
    
    bookmarked: [{
      type: String,
      default: [],
    }],
    
    cart: [{
      type: String,
      default: [],
    }],
    
    purchased: [{
      type: String,
      default: [],
    }],
    
    enrolled: [{
      type: String,
      default: [],
    }],
    
    subjects: [{
      type: String,
      default: [],
    }],
    
    contentTypes: [{
      type: String,
      default: [],
    }],
    
    difficultyLevels: [{
      type: String,
      default: [],
    }],
    
    priceRanges: [{
      type: String,
      default: [],
    }],
    
    searchQueries: [{
      type: String,
      default: [],
    }],
    
    lastViewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
userActivitySchema.index({ userId: 1, lastViewedAt: -1 });
userActivitySchema.index({ subjects: 1 });
userActivitySchema.index({ contentTypes: 1 });

// Prevent duplicates in arrays
userActivitySchema.pre('save', function(next) {
  // Remove duplicates from arrays
  const removeDuplicates = (arr: string[]) => [...new Set(arr)];
  
  this.viewedContent = removeDuplicates(this.viewedContent);
  this.bookmarked = removeDuplicates(this.bookmarked);
  this.cart = removeDuplicates(this.cart);
  this.purchased = removeDuplicates(this.purchased);
  this.enrolled = removeDuplicates(this.enrolled);
  this.subjects = removeDuplicates(this.subjects);
  this.contentTypes = removeDuplicates(this.contentTypes);
  this.difficultyLevels = removeDuplicates(this.difficultyLevels);
  this.priceRanges = removeDuplicates(this.priceRanges);
  this.searchQueries = removeDuplicates(this.searchQueries);
  
  next();
});

export const UserActivity: Model<IUserActivity> = 
  mongoose.models.UserActivity || mongoose.model<IUserActivity>('UserActivity', userActivitySchema);