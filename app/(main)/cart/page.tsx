'use client';

import { useRouter } from 'next/navigation'; // Updated import
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Package, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/hooks/useCart'; // Updated import path to lib
import { formatPrice } from '@/lib/helpers'; // Updated import path
import { toast } from 'sonner';
import BackToTop from '@/components/BackToTop';

const Cart = () => {
    const router = useRouter(); // Updated hook
    const { items, total, removeFromCart, updateItemQuantity, emptyCart } = useCart();

    const shippingFee = total > 5000 ? 0 : 150;
    const tax = Math.round(total * 0.05 * 100) / 100;
    const grandTotal = total + shippingFee + tax;

    if (items.length === 0) {
        return (
            <div className="pt-20 min-h-screen bg-gradient-to-b from-white to-bhutan-cream/30 flex items-center justify-center">
                <BackToTop />
                <div className="bhutan-container w-full">
                    <div className="max-w-lg mx-auto text-center py-20 px-6 animate-slide-in-up">
                        <div className="relative w-40 h-40 mx-auto mb-10 group">
                            <div className="absolute inset-0 bg-saffron/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-700 animate-pulse-slow" />
                            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-white to-gray-50 flex items-center justify-center shadow-xl border border-white/50 backdrop-blur-sm group-hover:scale-105 transition-transform duration-500">
                                <ShoppingBag className="w-16 h-16 text-saffron group-hover:rotate-12 transition-transform duration-500" />
                            </div>
                            {/* Floating elements */}
                            <div className="absolute top-0 right-0 w-8 h-8 bg-maroon/20 rounded-full blur-xl animate-float-slow" />
                            <div className="absolute bottom-4 left-4 w-6 h-6 bg-gold/20 rounded-full blur-xl animate-float-medium" />
                        </div>

                        <h1 className="text-4xl font-display font-bold mb-4 bg-gradient-to-r from-maroon to-saffron bg-clip-text text-transparent">
                            Your Cart is Empty
                        </h1>
                        <p className="text-muted-foreground text-lg mb-10 leading-relaxed max-w-sm mx-auto">
                            Looks like you haven't added anything to your cart yet. Discover our premium collection.
                        </p>
                        <Button
                            onClick={() => router.push('/products')}
                            className="bg-gradient-to-r from-saffron to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white shadow-xl hover:shadow-glow-lg transform hover:scale-105 transition-all duration-300 px-10 py-6 text-lg rounded-full"
                        >
                            Start Shopping
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-24 bg-gradient-to-b from-gray-50 to-white min-h-screen">
            <BackToTop />

            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-saffron/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-maroon/5 rounded-full blur-[80px]" />
            </div>

            <div className="bhutan-container relative z-10">
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-12 flex items-center gap-4">
                    <span className="bg-gradient-to-r from-maroon to-saffron bg-clip-text text-transparent">
                        Shopping Cart
                    </span>
                    <span className="text-2xl font-normal text-muted-foreground bg-gray-100 px-4 py-1 rounded-full">
                        {items.reduce((acc, item) => acc + item.quantity, 0)} items
                    </span>
                </h1>

                <div className="grid lg:grid-cols-12 gap-10 items-start">
                    {/* Cart Items List */}
                    <div className="lg:col-span-8 space-y-6">
                        {items.map((item, index) => (
                            <div
                                key={item.productId}
                                className="group relative flex flex-col sm:flex-row gap-6 p-6 bg-white/80 backdrop-blur-md border border-white/40 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 animate-slide-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Image */}
                                <div className="w-full sm:w-40 h-40 rounded-2xl bg-gray-50 flex-shrink-0 overflow-hidden shadow-inner relative group-hover:shadow-lg transition-all duration-500">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ShoppingBag className="w-10 h-10 text-gray-300" />
                                        </div>
                                    )}
                                    {/* Subtle overlay on hover */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start gap-4">
                                            <h3 className="font-display font-bold text-xl text-gray-900 line-clamp-2 leading-tight group-hover:text-maroon transition-colors">
                                                {item.title}
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    removeFromCart(item.productId);
                                                    toast.success('Item removed');
                                                }}
                                                className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-all duration-300 transform hover:rotate-12"
                                                title="Remove item"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {item.customization && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {item.customization.size && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                        Size: {item.customization.size}
                                                    </span>
                                                )}
                                                {item.customization.color && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                        Color: {item.customization.color}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-end justify-between mt-6">
                                        <p className="text-xl font-bold bg-gradient-to-r from-saffron to-maroon bg-clip-text text-transparent">
                                            {formatPrice(item.price)}
                                        </p>

                                        {/* Quantity Control */}
                                        <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 shadow-sm overflow-hidden">
                                            <button
                                                onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                                                className="w-10 h-10 flex items-center justify-center hover:bg-white hover:text-saffron active:scale-95 transition-all text-gray-500"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-10 text-center font-semibold text-gray-900 text-sm">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                                                className="w-10 h-10 flex items-center justify-center hover:bg-white hover:text-saffron active:scale-95 transition-all text-gray-500"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Features / Trust Badges */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/50 border border-white/60">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Secure Payment</p>
                                    <p className="text-xs text-muted-foreground">100% Protected</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/50 border border-white/60">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Fast Shipping</p>
                                    <p className="text-xs text-muted-foreground">Across Bhutan</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/50 border border-white/60">
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                    <Package className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Easy Returns</p>
                                    <p className="text-xs text-muted-foreground">Hassle-free</p>
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            onClick={emptyCart}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors w-full sm:w-auto"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear Everything
                        </Button>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit animate-slide-in-right">
                        <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-gray-200/50 p-8 border border-white/50 relative overflow-hidden">
                            {/* Ambient Background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-saffron/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                            <h2 className="text-2xl font-display font-bold mb-8 relative z-10">
                                Order Summary
                            </h2>

                            <div className="space-y-4 mb-8 relative z-10">
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-900">{formatPrice(total)}</span>
                                </div>
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Shipping</span>
                                    {shippingFee === 0 ? (
                                        <span className="font-medium text-green-600 px-2 py-0.5 bg-green-100 rounded text-xs uppercase tracking-wide">Free</span>
                                    ) : (
                                        <span className="font-medium text-gray-900">{formatPrice(shippingFee)}</span>
                                    )}
                                </div>
                                {shippingFee > 0 && (
                                    <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded-lg">
                                        Add {formatPrice(5000 - total)} more for free shipping
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Tax (5%)</span>
                                    <span className="font-medium text-gray-900">{formatPrice(tax)}</span>
                                </div>
                            </div>

                            <div className="relative mb-8">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-dashed border-gray-300"></div>
                                </div>
                            </div>

                            <div className="flex justify-between items-baseline mb-8 relative z-10">
                                <span className="text-lg font-medium text-gray-600">Total</span>
                                <span className="text-3xl font-display font-bold bg-gradient-to-r from-maroon to-saffron bg-clip-text text-transparent">
                                    {formatPrice(grandTotal)}
                                </span>
                            </div>

                            <Button
                                className="w-full bg-gradient-to-r from-saffron to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white shadow-xl hover:shadow-glow-lg transform hover:scale-[1.02] transition-all duration-300 py-7 text-lg rounded-xl relative overflow-hidden group"
                                onClick={() => router.push('/checkout')}
                            >
                                <span className="relative z-10 flex items-center justify-center">
                                    Proceed to Checkout
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </Button>

                            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground relative z-10">
                                <ShieldCheck className="w-3 h-3" />
                                Secure Checkout Process
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
