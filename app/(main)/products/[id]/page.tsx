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
import { SimilarProductsSection } from '@/components/SimilarProductsSection';

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
            originalPrice: currentProduct.price,
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
        <div className="pt-16 sm:pt-20 md:pt-24 pb-20 sm:pb-16 w-full overflow-x-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-50/50 via-white to-pink-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-2 sm:mt-4 relative">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-cyan-100/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="absolute top-1/2 left-0 -z-10 w-72 h-72 bg-pink-100/20 blur-3xl rounded-full -translate-x-1/2" />

                {/* Breadcrumb */}
                <nav className="text-sm mb-4 sm:mb-6 overflow-x-auto scrollbar-hide">
                    <ol className="flex items-center gap-2 whitespace-nowrap">
                        <li><Link href="/" className="text-gray-500 hover:text-saffron">Home</Link></li>
                        <li className="text-gray-400">/</li>
                        <li><Link href="/products" className="text-gray-500 hover:text-saffron">Products</Link></li>
                        <li className="text-gray-400">/</li>
                        <li className="text-saffron truncate max-w-[180px]">{currentProduct.title}</li>
                    </ol>
                </nav>

                {/* Main Product Grid - Sticky Layout */}
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start relative mt-4 sm:mt-6">

                    {/* Sticky Image Gallery */}
                    <div className="w-full lg:w-[45%] lg:sticky lg:top-28 space-y-4">
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
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
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

                    {/* Product Information & Actions */}
                    <div className="w-full lg:flex-1 space-y-6 sm:space-y-8 min-w-0">

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

                        {/* Description Summary */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-600/80 mb-1">Introduction</h3>
                            <div
                                className="text-gray-600 leading-relaxed text-sm sm:text-base line-clamp-4"
                                dangerouslySetInnerHTML={{ __html: currentProduct.description }}
                            />
                            <button className="text-pink-600 font-bold text-xs uppercase hover:underline" onClick={() => {
                                const el = document.getElementById('product-description');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}>
                                Read full story
                            </button>
                        </div>

                        {/* Feature Bento Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[
                                { label: 'Category', value: currentProduct.category, icon: Sparkles, color: 'text-cyan-600', bg: 'bg-cyan-50' },
                                { label: 'Stock', value: currentProduct.stock > 0 ? 'Available' : 'Out of Stock', icon: MessageSquare, color: 'text-pink-600', bg: 'bg-pink-50' },
                                { label: 'Rating', value: `${currentProduct.ratings.average} / 5`, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
                            ].map((feature) => (
                                <div key={feature.label} className={`${feature.bg} p-3 sm:p-4 rounded-2xl border border-white/50 shadow-sm transition-transform hover:scale-105 duration-300`}>
                                    <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                                        <feature.icon className={`w-3 h-3 sm:w-4 sm:h-4 ${feature.color}`} />
                                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-tight text-gray-400">{feature.label}</span>
                                    </div>
                                    <p className="font-bold text-xs sm:text-sm text-gray-800 capitalize leading-tight">{feature.value}</p>
                                </div>
                            ))}
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
                        <div className="flex flex-wrap items-end gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-gray-400">Quantity</label>
                                <div className="flex items-center bg-gray-100 p-1 rounded-xl w-fit">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-maroon transition-colors"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-12 text-center font-bold text-base">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(currentProduct.stock, quantity + 1))}
                                        className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-saffron transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1 mb-2">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${currentProduct.stock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                    <span className={`text-sm font-bold ${currentProduct.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {currentProduct.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400">{currentProduct.stock} items left</p>
                            </div>
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden lg:flex items-center gap-4 pt-4">
                            <Button
                                className="flex-1 h-14 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-colors shadow-xl shadow-gray-200"
                                onClick={handleAddToCart}
                                disabled={currentProduct.stock === 0}
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add to Cart
                            </Button>
                            <Button
                                className="flex-1 h-14 bg-saffron text-white rounded-2xl font-bold hover:bg-saffron-600 transition-colors shadow-xl shadow-saffron/20"
                                onClick={handleBuyNow}
                                disabled={currentProduct.stock === 0}
                            >
                                Buy It Now
                            </Button>
                            <button
                                onClick={() => toggleWishlist(currentProduct)}
                                className={`w-14 h-14 flex items-center justify-center rounded-2xl border-2 transition-all ${isFavorited ? 'border-pink-500 bg-pink-50 text-pink-500' : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'}`}
                            >
                                <Heart className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`} />
                            </button>
                        </div>

                        {/* Mobile Floating Action Bar */}
                        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 z-50 shadow-2xl safe-area-inset-bottom">
                            <div className="flex items-center gap-3">
                                <div className="flex-1 flex gap-2">
                                    <Button
                                        className="flex-1 h-12 bg-gray-900 text-white rounded-xl font-bold shadow-lg shadow-gray-200"
                                        onClick={handleAddToCart}
                                        disabled={currentProduct.stock === 0}
                                    >
                                        <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                                        Cart
                                    </Button>
                                    <Button
                                        className="flex-1 h-12 bg-saffron text-white rounded-xl font-bold shadow-lg"
                                        onClick={handleBuyNow}
                                        disabled={currentProduct.stock === 0}
                                    >
                                        Buy Now
                                    </Button>
                                </div>
                                <button
                                    onClick={() => toggleWishlist(currentProduct)}
                                    className={`w-12 h-12 flex items-center justify-center rounded-xl border transition-all ${isFavorited ? 'bg-pink-50 border-pink-100 text-pink-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                                >
                                    <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="mt-10 md:mt-16">
                    <Tabs defaultValue="description" className="w-full">
                        <div className="border-b border-gray-100 mb-8">
                            <TabsList className="bg-gray-100/50 p-1 gap-1 w-full sm:w-fit justify-start rounded-2xl flex overflow-x-auto scrollbar-hide">
                                {[
                                    { value: 'description', label: 'Description' },
                                    { value: 'reviews', label: `Reviews (${reviews.length})` },
                                    { value: 'shipping', label: 'Shipping' },
                                ].map((tab) => (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm px-6 py-2.5 text-xs font-bold text-gray-500 rounded-xl transition-all"
                                    >
                                        {tab.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        {/* Description Tab */}
                        <TabsContent value="description" className="mt-0 outline-none" id="product-description">
                            <div className="py-8 space-y-12">
                                <div className="max-w-3xl">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 text-sm">01</span>
                                        Product Story
                                    </h2>
                                    <div
                                        className="prose prose-lg max-w-none text-gray-700 leading-relaxed text-left break-words"
                                        dangerouslySetInnerHTML={{ __html: currentProduct.description }}
                                    />
                                </div>

                                {currentProduct.isCustomizable && (
                                    <div className="max-w-3xl">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-sm">02</span>
                                            Personalization Details
                                        </h2>
                                        <p className="text-gray-600 mb-4">This product is highly customizable. Check the options above to personalize your item with your preferred size, color, and custom text.</p>
                                        <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100 flex items-center gap-4">
                                            <Sparkles className="w-8 h-8 text-amber-500" />
                                            <p className="text-sm font-medium text-amber-900 font-display">Each personalized item is handcrafted ensuring the highest quality for your unique requirements.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
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
                                            'Free delivery on orders over Nu. 1000',
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
                    
                    {/* You May Also Like Section */}
                    {id && currentProduct && (
                        <div className="mt-16 pt-10 border-t border-gray-100">
                            <SimilarProductsSection
                                productId={id}
                                title="You May Also Like"
                                subtitle="Similar products based on this item"
                                limit={6}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
