import { Plus, Minus, ShoppingBag, Trash2, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/lib/hooks/useCart';
import { formatPrice } from '@/lib/helpers';

const CartDrawer = () => {
    const router = useRouter();
    const { items, total, isOpen, closeCart, removeFromCart, updateItemQuantity } = useCart();


    return (
        <Sheet open={isOpen} onOpenChange={closeCart}>
            <SheetContent className="w-full sm:max-w-md flex flex-col p-0 border-l border-white/20 bg-white/95 backdrop-blur-xl shadow-2xl">
                {/* Header - Glassmorphism */}
                <div className="relative z-20 px-6 py-4 border-b border-gray-100/50 bg-white/80 backdrop-blur-md">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-maroon via-saffron to-maroon" />
                    <SheetHeader className="flex flex-row items-center justify-between space-y-0">
                        <SheetTitle className="flex items-center gap-2 text-xl font-display font-bold">
                            <div className="w-8 h-8 rounded-full bg-saffron/10 flex items-center justify-center">
                                <ShoppingBag className="w-4 h-4 text-saffron" />
                            </div>
                            <span className="bg-gradient-to-r from-maroon to-gray-800 bg-clip-text text-transparent">
                                My Cart
                            </span>
                            <span className="text-sm font-medium text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full ml-1">
                                {items.length}
                            </span>
                        </SheetTitle>
                        <SheetClose asChild>
                            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-maroon">
                                <X className="w-5 h-5" />
                            </button>
                        </SheetClose>
                    </SheetHeader>
                </div>

                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-saffron/5 rounded-full blur-3xl animate-pulse-slow" />
                        </div>

                        <div className="relative z-10 animate-scale-in">
                            <div className="w-24 h-24 mx-auto mb-6 relative group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-gray-50 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
                                <div className="relative w-full h-full rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-lg group-hover:-translate-y-1 transition-transform duration-500">
                                    <ShoppingBag className="w-10 h-10 text-gray-300 group-hover:text-saffron transition-colors duration-500" />
                                </div>
                            </div>

                            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                Your cart is empty
                            </h3>
                            <p className="text-muted-foreground text-sm mb-8 max-w-[200px] mx-auto leading-relaxed">
                                Looks like you haven't added anything to your cart yet.
                            </p>
                            <Button
                                onClick={() => { closeCart(); router.push('/products'); }}
                                className="bg-gradient-to-r from-saffron to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white shadow-lg hover:shadow-glow-saffron transform hover:scale-105 transition-all duration-300 rounded-full px-8 py-6"
                            >
                                Start Shopping
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="flex-1 px-6 py-4">
                            <div className="space-y-4 pb-20">
                                {items.map((item, index) => (
                                    <div
                                        key={item.productId}
                                        className="group relative flex gap-4 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 animate-slide-in-right"
                                        style={{ animationDelay: `${index * 50} ms` }}
                                    >
                                        {/* Product Image */}
                                        <div className="w-20 h-20 rounded-xl bg-gray-50 flex-shrink-0 overflow-hidden relative">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ShoppingBag className="w-8 h-8 text-gray-300" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                            <div>
                                                <div className="flex justify-between items-start gap-2">
                                                    <h4 className="font-semibold text-sm text-gray-900 line-clamp-1 group-hover:text-maroon transition-colors">{item.title}</h4>
                                                    <button
                                                        onClick={() => removeFromCart(item.productId)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors p-1 -mr-1"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                {/* Customization Info */}
                                                {item.customization && (
                                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                        {item.customization.size && (
                                                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md border border-gray-200">
                                                                {item.customization.size}
                                                            </span>
                                                        )}
                                                        {item.customization.color && (
                                                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md border border-gray-200">
                                                                {item.customization.color}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-end justify-between mt-2">
                                                <span className="font-bold text-saffron text-sm">
                                                    {formatPrice(item.price)}
                                                </span>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-0.5 border border-gray-200">
                                                    <button
                                                        onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                                                        className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white hover:text-saffron hover:shadow-sm transition-all text-gray-500"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="w-6 text-center text-xs font-medium text-gray-900">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                                                        className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white hover:text-saffron hover:shadow-sm transition-all text-gray-500"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        {/* Sticky Footer */}
                        <div className="p-6 bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-[0_-5px_25px_-5px_rgba(0,0,0,0.05)] z-20">
                            <div className="space-y-3 mb-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-semibold text-gray-900">{formatPrice(total)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                        {total > 5000 ? 'Free Shipping Applied' : 'Calculated at checkout'}
                                    </span>
                                </div>
                            </div>

                            <Separator className="mb-4 bg-gray-100" />

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    className="w-full rounded-xl border-2 hover:bg-gray-50 hover:text-saffron hover:border-saffron/20 transition-all duration-300 font-bold"
                                    onClick={() => { closeCart(); router.push('/cart'); }}
                                >
                                    View Cart
                                </Button>
                                <Button
                                    className="w-full bg-gradient-to-r from-saffron to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white rounded-xl shadow-lg hover:shadow-glow-saffron transform hover:scale-[1.02] transition-all duration-300 font-bold group"
                                    onClick={() => { closeCart(); router.push('/checkout'); }}
                                >
                                    Checkout
                                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>

                            <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] text-muted-foreground">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Secure checkout powered by Stripe</span>
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default CartDrawer;
