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
import { Label } from '@/components/ui/label';
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
        <div className="pt-24 pb-16">
            <div className="bhutan-container">
                {/* Breadcrumb */}
                <nav className="text-sm mb-6">
                    <ol className="flex items-center gap-2">
                        <li><Link href="/" className="text-muted-foreground hover:text-saffron">Home</Link></li>
                        <li className="text-muted-foreground">/</li>
                        <li><Link href="/products" className="text-muted-foreground hover:text-saffron">Products</Link></li>
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
                        <div className="space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground/50 flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-muted-foreground/20"></span>
                                Product Story
                            </h3>
                            <div className="prose prose-slate max-w-none prose-headings:font-display prose-headings:font-bold prose-p:text-gray-600 prose-p:leading-relaxed prose-strong:text-maroon">
                                <div className="ql-editor !p-0" dangerouslySetInnerHTML={{ __html: currentProduct.description }} />
                            </div>
                        </div>

                        {/* Customization Options */}
                        {currentProduct.isCustomizable && currentProduct.customizationOptions && (
                            <div className="relative group overflow-hidden bg-gradient-to-br from-saffron/10 to-transparent border border-saffron/20 rounded-[2rem] p-8 space-y-6 transition-all duration-500 hover:shadow-2xl hover:shadow-saffron/5">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-saffron/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

                                <h3 className="relative font-display font-black text-lg flex items-center gap-3 text-gray-900">
                                    <div className="w-10 h-10 rounded-xl bg-saffron flex items-center justify-center shadow-lg shadow-saffron/30">
                                        <Sparkles className="w-5 h-5 text-white animate-pulse" />
                                    </div>
                                    Personalize Your Item
                                </h3>

                                <div className="relative space-y-6">
                                    {/* Size Selection */}
                                    {currentProduct.customizationOptions.availableSizes?.length > 0 && (
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Select Size</label>
                                            <div className="flex flex-wrap gap-3">
                                                {currentProduct.customizationOptions.availableSizes.map((size) => (
                                                    <button
                                                        key={size}
                                                        onClick={() => setCustomization({ ...customization, size })}
                                                        className={`h-12 min-w-[3rem] px-4 rounded-xl border-2 font-black transition-all duration-300 transform active:scale-95 ${customization.size === size
                                                            ? 'border-saffron bg-saffron text-white shadow-lg shadow-saffron/30'
                                                            : 'border-white bg-white/50 text-gray-600 hover:border-saffron/50 hover:bg-white'
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
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Choose Color</label>
                                            <div className="flex flex-wrap gap-3">
                                                {currentProduct.customizationOptions.availableColors.map((color) => (
                                                    <button
                                                        key={color}
                                                        onClick={() => setCustomization({ ...customization, color })}
                                                        className={`h-12 min-w-[3rem] px-4 rounded-xl border-2 font-black transition-all duration-300 transform active:scale-95 ${customization.color === color
                                                            ? 'border-saffron bg-saffron text-white shadow-lg shadow-saffron/30'
                                                            : 'border-white bg-white/50 text-gray-600 hover:border-saffron/50 hover:bg-white'
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
                                            <div key={field} className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{field}</label>
                                                <div className="relative group">
                                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-saffron to-maroon rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity" />
                                                    <Input
                                                        placeholder={`Enter ${field.toLowerCase()}...`}
                                                        value={customization.text?.[field] || ''}
                                                        onChange={(e) =>
                                                            setCustomization({
                                                                ...customization,
                                                                text: { ...customization.text, [field]: e.target.value },
                                                            })
                                                        }
                                                        className="relative bg-white/80 border-white/50 h-12 rounded-xl focus:ring-0 focus:border-saffron font-medium shadow-inner"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity & Actions Container */}
                        <div className="space-y-8 pt-4">
                            <div className="flex flex-wrap items-center gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Quantity</label>
                                    <div className="flex items-center bg-gray-100/50 p-1.5 rounded-2xl border-2 border-white/50 shadow-inner">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-maroon transition-colors transform active:scale-90"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-14 text-center font-display font-black text-lg">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(currentProduct.stock, quantity + 1))}
                                            className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-saffron transition-colors transform active:scale-90"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${currentProduct.stock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                        <span className={`text-sm font-black uppercase tracking-widest ${currentProduct.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {currentProduct.stock > 0 ? 'Instock' : 'Out of Stock'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium pl-4">{currentProduct.stock} items available</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Button
                                    size="lg"
                                    className="h-16 group relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 hover:from-black hover:to-black text-white rounded-2xl shadow-2xl transition-all duration-500 active:scale-[0.98]"
                                    onClick={handleAddToCart}
                                    disabled={currentProduct.stock === 0}
                                >
                                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-saffron to-maroon transform translate-y-1 group-hover:translate-y-0 transition-transform duration-500" />
                                    <span className="relative flex items-center justify-center gap-3 font-black text-lg uppercase tracking-widest">
                                        <Plus className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                                        Add to Cart
                                    </span>
                                </Button>
                                <Button
                                    size="lg"
                                    className="h-16 group relative overflow-hidden bg-gradient-to-r from-saffron to-saffron-600 hover:from-saffron-500 hover:to-saffron-600 text-white rounded-2xl shadow-2xl transition-all duration-500 active:scale-[0.98] border-none shadow-saffron/20"
                                    onClick={handleBuyNow}
                                    disabled={currentProduct.stock === 0}
                                >
                                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
                                    <span className="relative flex items-center justify-center gap-3 font-black text-lg uppercase tracking-widest">
                                        Buy Now
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Button>
                            </div>

                            {/* Social & Wishlist */}
                            <div className="flex items-center justify-between py-4 border-y border-gray-100">
                                <button
                                    onClick={() => currentProduct && toggleWishlist(currentProduct)}
                                    className={`flex items-center gap-3 group transition-all duration-300 ${isFavorited ? 'text-maroon' : 'text-gray-400 hover:text-maroon'
                                        }`}
                                >
                                    <div className={`p-2.5 rounded-full transition-all duration-500 ${isFavorited ? 'bg-maroon/10 scale-110 shadow-lg shadow-maroon/20' : 'bg-gray-50 group-hover:bg-maroon/5'}`}>
                                        <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-[0.15em]">{isFavorited ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                                </button>

                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mr-2">Share With Friends</span>
                                    <button className="p-2.5 rounded-full bg-gray-50 text-gray-400 hover:bg-bhutan-blue/5 hover:text-bhutan-blue transition-all duration-300">
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-3 gap-8 pt-4">
                            <div className="group text-center space-y-2">
                                <div className="w-12 h-12 bg-saffron/5 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-saffron/10 transition-colors">
                                    <Truck className="w-6 h-6 text-saffron" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-tight text-gray-400 group-hover:text-gray-600 transition-colors">Free Delivery</p>
                            </div>
                            <div className="group text-center space-y-2">
                                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-emerald-100/50 transition-colors">
                                    <Shield className="w-6 h-6 text-emerald-600" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-tight text-gray-400 group-hover:text-gray-600 transition-colors">Safe Payments</p>
                            </div>
                            <div className="group text-center space-y-2">
                                <div className="w-12 h-12 bg-bhutan-blue/5 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-bhutan-blue/10 transition-colors">
                                    <RefreshCw className="w-6 h-6 text-bhutan-blue" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-tight text-gray-400 group-hover:text-gray-600 transition-colors">7 Day Return</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section - Premium Overhaul */}
                <div className="mt-24">
                    <Tabs defaultValue="description" className="w-full">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-0 mb-12">
                            <TabsList className="bg-transparent h-auto p-0 gap-8">
                                <TabsTrigger
                                    value="description"
                                    className="data-[state=active]:bg-transparent data-[state=active]:text-black data-[state=active]:border-b-4 data-[state=active]:border-saffron bg-transparent border-0 rounded-none pb-4 text-sm font-black uppercase tracking-[0.2em] text-gray-400 transition-all"
                                >
                                    The Details
                                </TabsTrigger>
                                <TabsTrigger
                                    value="reviews"
                                    className="data-[state=active]:bg-transparent data-[state=active]:text-black data-[state=active]:border-b-4 data-[state=active]:border-saffron bg-transparent border-0 rounded-none pb-4 text-sm font-black uppercase tracking-[0.2em] text-gray-400 transition-all"
                                >
                                    Social Proof ({reviews.length})
                                </TabsTrigger>
                                <TabsTrigger
                                    value="shipping"
                                    className="data-[state=active]:bg-transparent data-[state=active]:text-black data-[state=active]:border-b-4 data-[state=active]:border-saffron bg-transparent border-0 rounded-none pb-4 text-sm font-black uppercase tracking-[0.2em] text-gray-400 transition-all"
                                >
                                    Logistics
                                </TabsTrigger>
                            </TabsList>
                            <div className="hidden md:flex items-center gap-4 text-xs font-bold text-gray-300">
                                <span>SKU: {currentProduct.sku}</span>
                                <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                <Link href="/help" className="hover:text-saffron">Need help?</Link>
                            </div>
                        </div>

                        <TabsContent value="description" className="mt-0 outline-none">
                            <div className="prose prose-lg max-w-4xl mx-auto py-12">
                                <div className="ql-editor !p-0" dangerouslySetInnerHTML={{ __html: currentProduct.description }} />
                            </div>
                        </TabsContent>

                        <TabsContent value="reviews" className="mt-0 outline-none">
                            <div className="grid lg:grid-cols-12 gap-16 py-12">
                                {/* Enhanced Review Summary */}
                                <div className="lg:col-span-4 space-y-12">
                                    <div className="relative overflow-hidden bg-white border-2 border-gray-100 p-10 rounded-[3rem] shadow-2xl shadow-gray-200/50">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 blur-3xl -mr-12 -mt-12" />
                                        <div className="flex flex-col items-center text-center space-y-4">
                                            <div className="text-6xl font-display font-black text-gray-900 leading-none">
                                                {currentProduct.ratings.average}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-5 h-5 ${i < Math.round(currentProduct.ratings.average)
                                                            ? 'text-gold fill-gold'
                                                            : 'text-gray-200'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-sm font-black uppercase tracking-widest text-gray-400">
                                                Based on {currentProduct.ratings.count} verified experiences
                                            </p>
                                        </div>
                                    </div>

                                    {isAuthenticated ? (
                                        <div className="relative group p-1 rounded-[2.5rem] bg-gradient-to-br from-saffron to-maroon">
                                            <div className="bg-white p-8 rounded-[2.3rem] space-y-8">
                                                <div className="space-y-2">
                                                    <h3 className="text-2xl font-display font-black text-gray-900">Write a Review</h3>
                                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Share your thoughts with us</p>
                                                </div>

                                                <form onSubmit={handleSubmitReview} className="space-y-8">
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Rate Quality</label>
                                                        <div className="flex items-center gap-3">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <button
                                                                    key={star}
                                                                    type="button"
                                                                    onMouseEnter={() => setHoverRating(star)}
                                                                    onMouseLeave={() => setHoverRating(0)}
                                                                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                                    className="transition-all duration-300 transform hover:scale-125 focus:outline-none"
                                                                >
                                                                    <Star
                                                                        className={`w-8 h-8 ${star <= (hoverRating || reviewForm.rating)
                                                                            ? 'text-gold fill-gold drop-shadow-glow'
                                                                            : 'text-gray-100'
                                                                            }`}
                                                                    />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Detailed Feedback</label>
                                                        <Textarea
                                                            placeholder="Describe your purchase..."
                                                            value={reviewForm.comment}
                                                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                                            className="bg-gray-50 border-gray-100 min-h-[140px] rounded-2xl focus:ring-4 focus:ring-saffron/10 focus:border-saffron/50 transition-all font-medium resize-none"
                                                        />
                                                    </div>

                                                    <Button
                                                        className="w-full h-16 bg-black text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                                                        disabled={isSubmittingReview}
                                                    >
                                                        {isSubmittingReview ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                                            <div className="flex items-center gap-3">
                                                                <span>Submit Post</span>
                                                                <Send className="w-5 h-5" />
                                                            </div>
                                                        )}
                                                    </Button>
                                                </form>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 border border-gray-100 p-12 rounded-[3.5rem] text-center space-y-8">
                                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-gray-200/50">
                                                <Shield className="w-10 h-10 text-gray-200" />
                                            </div>
                                            <div className="space-y-4">
                                                <h3 className="text-2xl font-display font-black text-gray-900">Buyer Exclusive</h3>
                                                <p className="text-sm text-gray-400 leading-relaxed font-bold px-4">Log in to leave a verified review and earn loyalty points on your purchase.</p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                onClick={() => router.push('/login')}
                                                className="w-full h-14 border-2 border-black text-black hover:bg-black hover:text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-500"
                                            >
                                                Login to Unlock
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Review List Container */}
                                <div className="lg:col-span-8">
                                    {reviews.length === 0 ? (
                                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50/50 rounded-[4rem] border-4 border-dashed border-white">
                                            <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-gray-200/50 mb-8 border border-gray-100">
                                                <MessageSquare className="w-12 h-12 text-gray-100" />
                                            </div>
                                            <p className="text-2xl font-display font-black text-gray-900 mb-2">Pioneer Feedback</p>
                                            <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-xs">No reviews documented yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            {reviews.map((review) => (
                                                <div key={review._id} className="group relative bg-white border border-gray-100 p-10 rounded-[3rem] hover:shadow-2xl hover:shadow-gray-200/50 hover:border-saffron/20 transition-all duration-700 transform hover:-translate-y-2">
                                                    <div className="flex items-start justify-between mb-8">
                                                        <div className="flex items-center gap-6">
                                                            <div className="relative">
                                                                <div className="absolute -inset-2 bg-gradient-to-br from-saffron to-maroon rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-all duration-700" />
                                                                <div className="relative w-16 h-16 rounded-full bg-gray-50 border-4 border-white overflow-hidden shadow-xl ring-2 ring-gray-100 group-hover:ring-saffron/20 transition-all duration-700">
                                                                    {review.userId.profilePicture ? (
                                                                        <img
                                                                            src={review.userId.profilePicture}
                                                                            alt={review.userId.fullName}
                                                                            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 font-display font-black text-2xl uppercase">
                                                                            {review.userId.fullName.charAt(0)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {review.isVerified && (
                                                                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                                                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="space-y-1">
                                                                <h4 className="font-display font-black text-xl text-gray-900 flex items-center gap-3">
                                                                    {review.userId.fullName}
                                                                </h4>
                                                                <div className="flex items-center gap-1">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star
                                                                            key={i}
                                                                            className={`w-3.5 h-3.5 ${i < review.rating
                                                                                ? 'text-gold fill-gold'
                                                                                : 'text-gray-100'
                                                                                }`}
                                                                        />
                                                                    ))}
                                                                    <span className="ml-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
                                                                        {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <p className="text-gray-600 text-lg leading-relaxed font-medium pl-6 border-l-[6px] border-gray-50 group-hover:border-saffron/30 transition-all duration-700">
                                                            "{review.comment}"
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="shipping" className="mt-0 outline-none">
                            <div className="grid md:grid-cols-2 gap-12 py-16">
                                <div className="space-y-8">
                                    <div className="bg-gray-50/50 p-10 rounded-[3rem] border border-white space-y-6">
                                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-gray-100">
                                            <Truck className="w-7 h-7 text-saffron" />
                                        </div>
                                        <h3 className="text-2xl font-display font-black text-gray-900">Shipping Policy</h3>
                                        <ul className="space-y-4">
                                            {[
                                                'Complimentary delivery on orders over Nu. 5000',
                                                'Regional standard: 3-5 business days',
                                                'City express: 24-48 hours delivery windows',
                                                'Real-time GPS tracking provided upon dispatch',
                                                'Discreet and secure premium packaging'
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-start gap-4 text-gray-600 font-medium">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-saffron mt-2 flex-shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className="space-y-8">
                                    <div className="bg-gray-50/50 p-10 rounded-[3rem] border border-white space-y-6">
                                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-gray-100">
                                            <RefreshCw className="w-7 h-7 text-maroon" />
                                        </div>
                                        <h3 className="text-2xl font-display font-black text-gray-900">Security & Returns</h3>
                                        <ul className="space-y-4">
                                            {[
                                                '7-day no-questions-asked inspection period',
                                                '100% money-back guarantee for genuine defects',
                                                'Hassle-free carrier pick-up for returns',
                                                'Dedicated support for customization queries',
                                                'Secured PCI-DSS level 3 payment processing'
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-start gap-4 text-gray-600 font-medium">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-maroon mt-2 flex-shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
