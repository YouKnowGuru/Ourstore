'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import Link from 'next/link';
import { useProducts } from '@/lib/hooks/useProducts';
import { useCart } from '@/lib/hooks/useCart';
import { useAuth } from '@/lib/hooks/useAuth';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { formatPrice, calculateDiscount } from '@/lib/helpers';
import { toast } from 'sonner';

export default function ProductDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        router.push('/checkout');
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error('Please login to leave a review');
            router.push('/login');
            return;
        }

        if (!reviewForm.comment.trim()) {
            toast.error('Please write a comment');
            return;
        }

        setIsSubmittingReview(true);
        try {
            toast.info('To ensure authentic feedback, please leave your review from the "My Orders" page.');
            router.push('/orders');
        } catch (error: any) {
            toast.error(error.message || 'Failed to submit review');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    return (
        <div className="pt-20 md:pt-24 pb-16 w-full overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

                {/* Breadcrumb */}
                <nav className="text-sm mb-6 overflow-x-auto">
                    <ol className="flex items-center gap-2 whitespace-nowrap">
                        <li><Link href="/" className="text-gray-500 hover:text-saffron">Home</Link></li>
                        <li className="text-gray-400">/</li>
                        <li><Link href="/products" className="text-gray-500 hover:text-saffron">Products</Link></li>
                        <li className="text-gray-400">/</li>
                        <li className="text-saffron truncate max-w-[180px]">{currentProduct.title}</li>
                    </ol>
                </nav>

                {/* Main Product Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">

                    {/* Image Gallery */}
                    <div className="space-y-3">
                        <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                            {currentProduct.images[selectedImage] ? (
                                <img
                                    src={currentProduct.images[selectedImage]}
                                    alt={currentProduct.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Sparkles className="w-16 h-16 text-gray-300" />
                                </div>
                            )}

                            {/* Badges */}
                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                                {discount > 0 && (
                                    <span className="px-2.5 py-1 bg-saffron text-white text-xs font-bold rounded-lg">
                                        -{discount}% OFF
                                    </span>
                                )}
                                {currentProduct.isCustomizable && (
                                    <span className="px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" />
                                        Custom
                                    </span>
                                )}
                            </div>

                            {/* Navigation Arrows */}
                            {currentProduct.images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : currentProduct.images.length - 1))}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setSelectedImage((prev) => (prev < currentProduct.images.length - 1 ? prev + 1 : 0))}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnail Gallery */}
                        {currentProduct.images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {currentProduct.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${selectedImage === index ? 'border-saffron' : 'border-transparent'}`}
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
                    <div className="space-y-5 min-w-0">

                        {/* Title & Rating */}
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold mb-2 break-words leading-snug">
                                {currentProduct.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2">
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
                                <span className="text-sm text-gray-500">
                                    {currentProduct.ratings.average} ({currentProduct.ratings.count} reviews)
                                </span>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="flex flex-wrap items-baseline gap-3">
                            <span className="text-2xl sm:text-3xl font-bold text-saffron">
                                {formatPrice(currentProduct.discountPrice || currentProduct.price)}
                            </span>
                            {currentProduct.discountPrice && (
                                <span className="text-lg text-gray-400 line-through">
                                    {formatPrice(currentProduct.price)}
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Product Description</h3>
                            <div
                                className="prose prose-sm max-w-none text-gray-600 break-words overflow-hidden"
                                dangerouslySetInnerHTML={{ __html: currentProduct.description }}
                            />
                        </div>

                        {/* Customization Options */}
                        {currentProduct.isCustomizable && currentProduct.customizationOptions && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-4">
                                <h3 className="font-bold text-base flex items-center gap-2 text-gray-900">
                                    <Sparkles className="w-4 h-4 text-saffron" />
                                    Personalize Your Item
                                </h3>
                                <div className="space-y-4">
                                    {currentProduct.customizationOptions.availableSizes?.length > 0 && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Select Size</label>
                                            <div className="flex flex-wrap gap-2">
                                                {currentProduct.customizationOptions.availableSizes.map((size) => (
                                                    <button
                                                        key={size}
                                                        onClick={() => setCustomization({ ...customization, size })}
                                                        className={`h-10 min-w-[2.5rem] px-3 rounded-lg border-2 text-sm font-bold transition-all ${customization.size === size
                                                            ? 'border-saffron bg-saffron text-white'
                                                            : 'border-gray-200 bg-white text-gray-600 hover:border-saffron/50'
                                                            }`}
                                                    >
                                                        {size}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {currentProduct.customizationOptions.availableColors?.length > 0 && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Choose Color</label>
                                            <div className="flex flex-wrap gap-2">
                                                {currentProduct.customizationOptions.availableColors.map((color) => (
                                                    <button
                                                        key={color}
                                                        onClick={() => setCustomization({ ...customization, color })}
                                                        className={`h-10 min-w-[2.5rem] px-3 rounded-lg border-2 text-sm font-bold transition-all ${customization.color === color
                                                            ? 'border-saffron bg-saffron text-white'
                                                            : 'border-gray-200 bg-white text-gray-600 hover:border-saffron/50'
                                                            }`}
                                                    >
                                                        {color}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {currentProduct.customizationOptions.allowTextInput &&
                                        currentProduct.customizationOptions.textFields?.map((field) => (
                                            <div key={field} className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">{field}</label>
                                                <Input
                                                    placeholder={`Enter ${field.toLowerCase()}...`}
                                                    value={customization.text?.[field] || ''}
                                                    onChange={(e) =>
                                                        setCustomization({
                                                            ...customization,
                                                            text: { ...customization.text, [field]: e.target.value },
                                                        })
                                                    }
                                                    className="h-10 rounded-xl border-gray-200"
                                                />
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity & Stock */}
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-wide text-gray-400">Quantity</label>
                                <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-9 h-9 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-maroon transition-colors"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-10 text-center font-bold text-base">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(currentProduct.stock, quantity + 1))}
                                        className="w-9 h-9 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-saffron transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 mt-5">
                                    <div className={`w-2 h-2 rounded-full ${currentProduct.stock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                    <span className={`text-sm font-bold ${currentProduct.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {currentProduct.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400">{currentProduct.stock} items left</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Button
                                size="lg"
                                className="h-12 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-sm transition-all"
                                onClick={handleAddToCart}
                                disabled={currentProduct.stock === 0}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add to Cart
                            </Button>
                            <Button
                                size="lg"
                                className="h-12 bg-saffron hover:bg-saffron/90 text-white rounded-xl font-bold text-sm transition-all border-none"
                                onClick={handleBuyNow}
                                disabled={currentProduct.stock === 0}
                            >
                                Buy Now
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>

                        {/* Wishlist & Share */}
                        <div className="flex flex-wrap items-center justify-between py-3 border-y border-gray-100 gap-3">
                            <button
                                onClick={() => currentProduct && toggleWishlist(currentProduct)}
                                className={`flex items-center gap-2 text-sm font-bold transition-colors ${isFavorited ? 'text-maroon' : 'text-gray-400 hover:text-maroon'}`}
                            >
                                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                                {isFavorited ? 'Saved' : 'Add to Wishlist'}
                            </button>
                            <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                                <Share2 className="w-4 h-4" />
                                Share
                            </button>
                        </div>

                        {/* Feature Icons */}
                        <div className="grid grid-cols-3 gap-3 pt-2">
                            {[
                                { Icon: Truck, label: 'Free Delivery', color: 'text-saffron', bg: 'bg-amber-50' },
                                { Icon: Shield, label: 'Safe Payment', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                { Icon: RefreshCw, label: '7 Day Return', color: 'text-blue-600', bg: 'bg-blue-50' },
                            ].map(({ Icon, label, color, bg }) => (
                                <div key={label} className="text-center space-y-1.5">
                                    <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mx-auto`}>
                                        <Icon className={`w-5 h-5 ${color}`} />
                                    </div>
                                    <p className="text-[10px] font-bold uppercase text-gray-400 leading-tight">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="mt-12 md:mt-16">
                    <Tabs defaultValue="description" className="w-full">
                        <div className="border-b border-gray-200 mb-6">
                            <TabsList className="bg-transparent h-auto p-0 gap-0 w-full justify-start overflow-x-auto flex scrollbar-hide">
                                {[
                                    { value: 'description', label: 'Description' },
                                    { value: 'reviews', label: `Reviews (${reviews.length})` },
                                    { value: 'shipping', label: 'Shipping' },
                                ].map((tab) => (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        className="data-[state=active]:bg-transparent data-[state=active]:text-saffron data-[state=active]:border-b-2 data-[state=active]:border-saffron bg-transparent border-0 rounded-none px-4 md:px-6 pb-3 pt-0 text-sm font-bold text-gray-500 whitespace-nowrap transition-all flex-shrink-0"
                                    >
                                        {tab.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        {/* Description Tab */}
                        <TabsContent value="description" className="mt-0 outline-none">
                            <div
                                className="prose prose-sm md:prose-base max-w-none text-gray-700 break-words overflow-hidden py-4"
                                dangerouslySetInnerHTML={{ __html: currentProduct.description }}
                            />
                        </TabsContent>

                        {/* Reviews Tab */}
                        <TabsContent value="reviews" className="mt-0 outline-none">
                            <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 py-4">

                                {/* Review Summary + Form */}
                                <div className="lg:col-span-4 space-y-6">
                                    {/* Rating Summary */}
                                    <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm text-center space-y-3">
                                        <div className="text-5xl font-bold text-gray-900">{currentProduct.ratings.average}</div>
                                        <div className="flex justify-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-5 h-5 ${i < Math.round(currentProduct.ratings.average) ? 'text-gold fill-gold' : 'text-gray-200'}`} />
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-400 font-medium">Based on {currentProduct.ratings.count} reviews</p>
                                    </div>

                                    {/* Write Review / Login */}
                                    {isAuthenticated ? (
                                        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm space-y-4">
                                            <h3 className="text-lg font-bold text-gray-900">Write a Review</h3>
                                            <form onSubmit={handleSubmitReview} className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onMouseEnter={() => setHoverRating(star)}
                                                            onMouseLeave={() => setHoverRating(0)}
                                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                            className="focus:outline-none"
                                                        >
                                                            <Star className={`w-7 h-7 ${star <= (hoverRating || reviewForm.rating) ? 'text-gold fill-gold' : 'text-gray-200'}`} />
                                                        </button>
                                                    ))}
                                                </div>
                                                <Textarea
                                                    placeholder="Share your experience..."
                                                    value={reviewForm.comment}
                                                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                                    className="min-h-[100px] rounded-xl text-sm"
                                                />
                                                <Button className="w-full bg-gray-900 text-white rounded-xl h-11 font-bold" disabled={isSubmittingReview}>
                                                    {isSubmittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                                        <span className="flex items-center gap-2"><Send className="w-4 h-4" /> Submit Review</span>
                                                    )}
                                                </Button>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl text-center space-y-4">
                                            <Shield className="w-10 h-10 text-gray-300 mx-auto" />
                                            <div>
                                                <h3 className="font-bold text-gray-900">Login to Review</h3>
                                                <p className="text-sm text-gray-400 mt-1">Share your experience with other buyers.</p>
                                            </div>
                                            <Button variant="outline" onClick={() => router.push('/login')} className="w-full rounded-xl font-bold">
                                                Sign In
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Review List */}
                                <div className="lg:col-span-8">
                                    {reviews.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center space-y-3">
                                            <MessageSquare className="w-10 h-10 text-gray-300" />
                                            <p className="font-bold text-gray-500">No reviews yet</p>
                                            <p className="text-sm text-gray-400">Be the first to review this product</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {reviews.map((review) => (
                                                <div key={review._id} className="bg-white border border-gray-100 p-4 md:p-6 rounded-2xl space-y-3">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                                                            {review.userId.profilePicture ? (
                                                                <img src={review.userId.profilePicture} alt={review.userId.fullName} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                                                                    {review.userId.fullName.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <h4 className="font-bold text-gray-900 text-sm">{review.userId.fullName}</h4>
                                                                {review.isVerified && (
                                                                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-gold fill-gold' : 'text-gray-200'}`} />
                                                                ))}
                                                                <span className="text-xs text-gray-400 ml-1">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-600 leading-relaxed border-l-2 border-gray-100 pl-3 break-words">
                                                        "{review.comment}"
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        {/* Shipping Tab */}
                        <TabsContent value="shipping" className="mt-0 outline-none">
                            <div className="grid md:grid-cols-2 gap-6 py-4">
                                <div className="bg-gray-50 p-5 rounded-2xl space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                            <Truck className="w-5 h-5 text-saffron" />
                                        </div>
                                        <h3 className="text-base font-bold text-gray-900">Shipping Policy</h3>
                                    </div>
                                    <ul className="space-y-2">
                                        {[
                                            'Free delivery on orders over Nu. 5000',
                                            'Standard: 3-5 business days',
                                            'Express: 24-48 hours',
                                            'Real-time tracking provided',
                                            'Secure premium packaging',
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                <span className="w-1.5 h-1.5 rounded-full bg-saffron mt-1.5 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-gray-50 p-5 rounded-2xl space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                                            <RefreshCw className="w-5 h-5 text-maroon" />
                                        </div>
                                        <h3 className="text-base font-bold text-gray-900">Returns Policy</h3>
                                    </div>
                                    <ul className="space-y-2">
                                        {[
                                            '7-day inspection period',
                                            '100% money-back for defects',
                                            'Hassle-free carrier pick-up',
                                            'Support for customization queries',
                                            'Secure payment processing',
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                <span className="w-1.5 h-1.5 rounded-full bg-maroon mt-1.5 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
