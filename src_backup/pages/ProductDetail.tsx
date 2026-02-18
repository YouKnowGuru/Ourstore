import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Heart,
  Share2,
  Truck,
  Shield,
  RefreshCw,
  Star,
  Minus,
  Plus,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Send,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useWishlist } from '@/hooks/useWishlist';
import { formatPrice, calculateDiscount } from '@/utils/helpers';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { currentProduct, reviews, loading, getProduct, clearProduct } = useProducts();
  const { addToCart, openCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isFavorited = id ? isInWishlist(id) : false;

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [customization, setCustomization] = useState<{
    text?: Record<string, string>;
    size?: string;
    color?: string;
  }>({});

  useEffect(() => {
    if (id) {
      getProduct(id);
    }
    return () => {
      clearProduct();
    };
  }, [id]);

  if (loading || !currentProduct) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron" />
      </div>
    );
  }

  const discount = currentProduct.discountPrice
    ? calculateDiscount(currentProduct.price, currentProduct.discountPrice)
    : 0;

  const handleAddToCart = () => {
    if (currentProduct.isCustomizable) {
      const opts = currentProduct.customizationOptions;
      if (opts?.allowTextInput && opts.textFields) {
        for (const field of opts.textFields) {
          if (!customization.text?.[field]) {
            toast.error(`Please fill in the ${field} field`);
            return;
          }
        }
      }
      if (opts?.availableSizes?.length && !customization.size) {
        toast.error('Please select a size');
        return;
      }
      if (opts?.availableColors?.length && !customization.color) {
        toast.error('Please select a color');
        return;
      }
    }

    addToCart({
      productId: currentProduct._id,
      title: currentProduct.title,
      price: currentProduct.discountPrice || currentProduct.price,
      quantity,
      image: currentProduct.images[0],
      customization: currentProduct.isCustomizable ? customization : undefined,
    });

    toast.success('Added to cart');
    openCart();
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to leave a review');
      navigate('/login');
      return;
    }

    if (!reviewForm.comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setIsSubmittingReview(true);
    try {
      // Find an order with this product to get orderId (simple logic for now)
      // Usually, we'd pass this from the order history page
      // For now, we'll try to find any completed order index if needed, 
      // but the backend requires orderId. In a real scenario, 
      // users can only review from their "Orders" page.
      // But we'll try to implement a generic "Create Review" for Demo if backend allows.

      // Since backend requires orderId, we'll suggest users to review from "My Orders" 
      // or we'll fetch orders here.
      toast.info('To ensure authentic feedback, please leave your review from the "My Orders" page.');
      navigate('/orders');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="pt-24 pb-16">
      <div className="bhutan-container">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6">
          <ol className="flex items-center gap-2">
            <li><a href="/" className="text-muted-foreground hover:text-saffron">Home</a></li>
            <li className="text-muted-foreground">/</li>
            <li><a href="/products" className="text-muted-foreground hover:text-saffron">Products</a></li>
            <li className="text-muted-foreground">/</li>
            <li className="text-saffron truncate max-w-xs">{currentProduct.title}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
              {currentProduct.images[selectedImage] ? (
                <img
                  src={currentProduct.images[selectedImage]}
                  alt={currentProduct.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Sparkles className="w-20 h-20 text-gray-300" />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {discount > 0 && (
                  <span className="px-3 py-1 bg-saffron text-white text-sm font-medium rounded">
                    -{discount}% OFF
                  </span>
                )}
                {currentProduct.isCustomizable && (
                  <span className="px-3 py-1 bg-bhutan-blue text-white text-sm font-medium rounded flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    Customizable
                  </span>
                )}
              </div>

              {/* Navigation Arrows */}
              {currentProduct.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : currentProduct.images.length - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev < currentProduct.images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {currentProduct.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {currentProduct.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${selectedImage === index ? 'border-saffron' : 'border-transparent'
                      }`}
                  >
                    <img
                      src={image}
                      alt={`${currentProduct.title} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
                {currentProduct.title}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(currentProduct.ratings.average)
                        ? 'text-gold fill-gold'
                        : 'text-gray-300'
                        }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {currentProduct.ratings.average} ({currentProduct.ratings.count} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-saffron">
                {formatPrice(currentProduct.discountPrice || currentProduct.price)}
              </span>
              {currentProduct.discountPrice && (
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(currentProduct.price)}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: currentProduct.description }} />
            </div>

            {/* Customization Options */}
            {currentProduct.isCustomizable && currentProduct.customizationOptions && (
              <div className="bg-saffron/5 rounded-xl p-6 space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-saffron" />
                  Customization Options
                </h3>

                {/* Size Selection */}
                {currentProduct.customizationOptions.availableSizes?.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Size</label>
                    <div className="flex flex-wrap gap-2">
                      {currentProduct.customizationOptions.availableSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setCustomization({ ...customization, size })}
                          className={`px-4 py-2 rounded-lg border transition-colors ${customization.size === size
                            ? 'border-saffron bg-saffron text-white'
                            : 'border-gray-200 hover:border-saffron'
                            }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {currentProduct.customizationOptions.availableColors?.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Color</label>
                    <div className="flex flex-wrap gap-2">
                      {currentProduct.customizationOptions.availableColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setCustomization({ ...customization, color })}
                          className={`px-4 py-2 rounded-lg border transition-colors ${customization.color === color
                            ? 'border-saffron bg-saffron text-white'
                            : 'border-gray-200 hover:border-saffron'
                            }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Text Input Fields */}
                {currentProduct.customizationOptions.allowTextInput &&
                  currentProduct.customizationOptions.textFields?.map((field) => (
                    <div key={field}>
                      <label className="text-sm font-medium mb-2 block">{field}</label>
                      <Input
                        placeholder={`Enter ${field.toLowerCase()}`}
                        value={customization.text?.[field] || ''}
                        onChange={(e) =>
                          setCustomization({
                            ...customization,
                            text: { ...customization.text, [field]: e.target.value },
                          })
                        }
                      />
                    </div>
                  ))}
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(currentProduct.stock, quantity + 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm text-muted-foreground">
                {currentProduct.stock} available
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1 bg-saffron hover:bg-saffron-600"
                onClick={handleAddToCart}
                disabled={currentProduct.stock === 0}
              >
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 border-maroon text-maroon hover:bg-maroon hover:text-white"
                onClick={handleBuyNow}
                disabled={currentProduct.stock === 0}
              >
                Buy Now
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => currentProduct && toggleWishlist(currentProduct)}
                className={`flex items-center gap-2 text-sm transition-all duration-300 ${isFavorited ? 'text-saffron font-bold' : 'text-muted-foreground hover:text-saffron'
                  }`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                {isFavorited ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-saffron">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto mb-2 text-saffron" />
                <p className="text-xs text-muted-foreground">Free Delivery over Nu. 5000</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto mb-2 text-saffron" />
                <p className="text-xs text-muted-foreground">Quality Guaranteed</p>
              </div>
              <div className="text-center">
                <RefreshCw className="w-6 h-6 mx-auto mb-2 text-saffron" />
                <p className="text-xs text-muted-foreground">Easy Returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
              <TabsTrigger value="shipping">Shipping Info</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: currentProduct.description }} />
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="grid lg:grid-cols-3 gap-10">
                {/* Review Form - High End Glass */}
                <div className="lg:col-span-1">
                  {isAuthenticated ? (
                    <div className="glass-dark border border-white/10 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-saffron/5 to-maroon/5 opacity-50" />

                      <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-saffron/10 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-saffron" />
                          </div>
                          <h3 className="text-xl font-bold text-white">Share Your Experience</h3>
                        </div>

                        <form onSubmit={handleSubmitReview} className="space-y-6">
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-white/40">Your Rating</Label>
                            <div className="flex items-center gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onMouseEnter={() => setHoverRating(star)}
                                  onMouseLeave={() => setHoverRating(0)}
                                  onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                  className="transition-all duration-300 transform hover:scale-125"
                                >
                                  <Star
                                    className={`w-8 h-8 ${star <= (hoverRating || reviewForm.rating)
                                      ? 'text-gold fill-gold drop-shadow-glow-gold'
                                      : 'text-white/20'
                                      }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-white/40">Review Comments</Label>
                            <Textarea
                              placeholder="What did you love about this product?"
                              value={reviewForm.comment}
                              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-2xl min-h-[120px] focus:ring-saffron/20 focus:border-saffron/50 transition-all font-medium"
                            />
                          </div>

                          <Button
                            className="w-full h-14 bg-gradient-to-r from-saffron to-saffron-600 hover:scale-[1.02] text-white rounded-2xl font-black shadow-xl transition-all duration-500 flex items-center justify-center gap-2"
                            disabled={isSubmittingReview}
                          >
                            {isSubmittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                              <>
                                <span>Submit Review</span>
                                <Send className="w-4 h-4" />
                              </>
                            )}
                          </Button>
                        </form>
                      </div>
                    </div>
                  ) : (
                    <div className="glass-dark border border-white/10 p-10 rounded-[2.5rem] text-center space-y-6">
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto">
                        <Shield className="w-8 h-8 text-white/40" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white">Join the Community</h3>
                        <p className="text-sm text-white/50 leading-relaxed font-medium">Please login to share your valued feedback and help other buyers.</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => navigate('/login')}
                        className="w-full h-12 border-white/10 text-white hover:bg-white/10 rounded-xl font-bold"
                      >
                        Login to Review
                      </Button>
                    </div>
                  )}
                </div>

                {/* Review List */}
                <div className="lg:col-span-2">
                  {reviews.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-6">
                        <MessageSquare className="w-10 h-10 text-gray-200" />
                      </div>
                      <p className="text-gray-400 font-bold text-lg">Be the first to share your thoughts!</p>
                      <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest font-black opacity-60">No reviews found</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review._id} className="group relative bg-white border border-gray-100 p-8 rounded-[2rem] hover:shadow-2xl hover:border-saffron/20 transition-all duration-500 transform hover:-translate-y-1">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-br from-saffron to-maroon rounded-full blur-md opacity-0 group-hover:opacity-20 transition-opacity" />
                                <div className="relative w-14 h-14 rounded-full bg-gray-100 border-2 border-white overflow-hidden shadow-sm">
                                  {review.userId.profilePicture ? (
                                    <img
                                      src={review.userId.profilePicture}
                                      alt={review.userId.fullName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 font-black text-xl">
                                      {review.userId.fullName.charAt(0)}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-black text-gray-900 flex items-center gap-2">
                                  {review.userId.fullName}
                                  {review.isVerified && (
                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-tighter">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Verified Buyer
                                    </div>
                                  )}
                                </h4>
                                <div className="flex items-center gap-1 mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${i < review.rating
                                        ? 'text-gold fill-gold'
                                        : 'text-gray-200'
                                        }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-600 leading-relaxed font-medium pl-2 border-l-4 border-gray-50 group-hover:border-saffron/20 transition-colors">
                            {review.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shipping" className="mt-6">
              <div className="prose max-w-none">
                <h3>Shipping Information</h3>
                <ul>
                  <li>Free delivery on orders over Nu. 5000</li>
                  <li>Standard delivery: 3-5 business days</li>
                  <li>Express delivery: 1-2 business days (additional charges apply)</li>
                  <li>Cash on Delivery available</li>
                </ul>
                <h3>Return Policy</h3>
                <ul>
                  <li>7-day return policy for unused items</li>
                  <li>Custom products cannot be returned unless defective</li>
                  <li>Refund processed within 5-7 business days</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
