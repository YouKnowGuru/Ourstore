'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Eye, RotateCcw, Star, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useOrders } from '@/lib/hooks/useOrders';
import { productAPI } from '@/lib/services/api';
import { formatPrice, formatDate, getOrderStatusColor } from '@/lib/helpers';
import { toast } from 'sonner';

const Orders = () => {
    const router = useRouter();
    const { orders, loading, getOrders } = useOrders();
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reviewForm, setReviewForm] = useState({
        rating: 5,
        comment: ''
    });
    const [hoverRating, setHoverRating] = useState(0);

    useEffect(() => {
        getOrders();
    }, []);

    const handleOpenReview = (product: any, orderId: string) => {
        setSelectedProduct({ ...product, orderId });
        setReviewForm({ rating: 5, comment: '' });
        setIsReviewDialogOpen(true);
    };

    const handleSubmitReview = async () => {
        if (!reviewForm.comment.trim()) {
            toast.error('Please write a comment');
            return;
        }

        setIsSubmitting(true);
        try {
            await productAPI.createReview({
                productId: selectedProduct.productId,
                orderId: selectedProduct.orderId,
                rating: reviewForm.rating,
                comment: reviewForm.comment
            });
            toast.success('Review submitted successfully!');
            setIsReviewDialogOpen(false);
            getOrders(); // Refresh to update status if tracked
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron" />
            </div>
        );
    }

    return (
        <div className="pt-24 pb-16">
            <div className="bhutan-container max-w-5xl">
                <h1 className="text-3xl font-display font-bold mb-8">My Orders</h1>

                {orders.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl">
                        <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
                        <p className="text-muted-foreground mb-6">
                            You haven't placed any orders yet.
                        </p>
                        <Button onClick={() => router.push('/products')} className="bg-saffron hover:bg-saffron-600">
                            Start Shopping
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Order Number</p>
                                        <p className="font-medium">{order.orderNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date</p>
                                        <p className="font-medium">{formatDate(order.createdAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total</p>
                                        <p className="font-medium text-saffron">{formatPrice(order.total)}</p>
                                    </div>
                                    <Badge className={getOrderStatusColor(order.orderStatus)}>
                                        {order.orderStatus}
                                    </Badge>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex items-center gap-4 overflow-x-auto pb-2">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="flex-shrink-0 flex items-center gap-3">
                                                <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden">
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="w-6 h-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm text-gray-900 truncate max-w-[200px]">{item.title}</p>
                                                    <p className="text-xs text-muted-foreground font-medium">Qty: {item.quantity}</p>
                                                </div>
                                                {order.orderStatus === 'Delivered' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 text-saffron hover:text-saffron-600 hover:bg-saffron/5 font-bold text-xs gap-1.5"
                                                        onClick={() => handleOpenReview(item, order._id)}
                                                    >
                                                        <Star className="w-3.5 h-3.5" />
                                                        Rate & Review
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <Button variant="outline" size="sm" onClick={() => router.push(`/orders/${order._id}`)}>
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                    </Button>
                                    {order.orderStatus === 'Delivered' && (
                                        <Button variant="outline" size="sm">
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            Return
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Review Dialog */}
                <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                    <DialogContent className="sm:max-w-md rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                        <div className="bg-gradient-to-br from-maroon to-maroon-800 p-8 text-white relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-saffron/10 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                                        <Star className="w-6 h-6 text-saffron fill-saffron" />
                                    </div>
                                    Rate Product
                                </DialogTitle>
                                <DialogDescription className="text-white/70 font-medium pt-2">
                                    Share your experience with <strong>{selectedProduct?.title}</strong>
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <div className="p-8 space-y-8 bg-white">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Overall Rating</Label>
                                <div className="flex items-center gap-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                            className="transition-all duration-300 transform hover:scale-125 focus:outline-none"
                                        >
                                            <Star
                                                className={`w-10 h-10 ${star <= (hoverRating || reviewForm.rating)
                                                    ? 'text-gold fill-gold drop-shadow-glow-gold'
                                                    : 'text-gray-100'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Your Feedback</Label>
                                <div className="relative">
                                    <Textarea
                                        placeholder="Tell us what you think..."
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                        className="min-h-[140px] rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-saffron/20 transition-all font-medium resize-none p-4"
                                    />
                                    <div className="absolute bottom-4 right-4 text-[10px] font-black text-gray-300 uppercase">
                                        Authentic Review
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-14 rounded-2xl font-bold border-gray-100 hover:bg-gray-50"
                                    onClick={() => setIsReviewDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 h-14 rounded-2xl bg-saffron hover:bg-saffron-600 text-white font-black shadow-lg shadow-saffron/20 transition-all flex items-center justify-center gap-2"
                                    onClick={handleSubmitReview}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <>
                                            <span>Submit Review</span>
                                            <Send className="w-4 h-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default Orders;
