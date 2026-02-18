import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import ProductCard from '@/components/ProductCard';

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlist, loading, getWishlist } = useWishlist();
  const { openCart } = useCart();

  useEffect(() => {
    getWishlist();
  }, [getWishlist]);

  if (loading && wishlist.length === 0) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-saffron animate-spin"></div>
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-maroon animate-spin absolute top-0 left-0 scale-75 opacity-50"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-gray-50/30">
      <div className="bhutan-container">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-saffron/10 flex items-center justify-center">
                <Heart className="w-6 h-6 text-saffron fill-saffron" />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-black text-gray-900 tracking-tight">My Wishlist</h1>
            </div>
            <p className="text-gray-500 font-medium pl-1">
              Your curated collection of Bhutanese treasures
            </p>
          </div>

          {wishlist.length > 0 && (
            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
              <div className="px-4 py-2">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest block">Items</span>
                <span className="text-xl font-black text-gray-900">{wishlist.length}</span>
              </div>
              <div className="w-px h-8 bg-gray-100" />
              <Button
                onClick={() => navigate('/products')}
                variant="ghost"
                className="rounded-xl font-bold gap-2 text-saffron hover:bg-saffron/5"
              >
                Continue Shopping
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-20 bg-white rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-saffron/5 to-maroon/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative z-10 space-y-8 px-10">
              <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto transform group-hover:rotate-12 transition-transform duration-500">
                <Heart className="w-12 h-12 text-gray-200" />
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-gray-900">Your wishlist is empty</h2>
                <p className="text-gray-500 font-medium leading-relaxed max-w-md mx-auto">
                  Explore our authentic collection and save your favorite Bhutanese products for later.
                </p>
              </div>

              <Button
                onClick={() => navigate('/products')}
                className="h-14 px-10 rounded-2xl bg-saffron hover:bg-saffron-600 text-white font-black shadow-xl shadow-saffron/20 transition-all transform hover:scale-105"
              >
                Explore Products
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {wishlist.map((product) => (
              <div key={product._id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* Decorative CTA */}
        {wishlist.length > 0 && (
          <div className="mt-20 p-12 bg-white rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-saffron/5 blur-3xl rounded-full translate-x-32 -translate-y-32" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to checkout?</h3>
                <p className="text-gray-500 font-medium">Your items are waiting to find their home in Bhutan.</p>
              </div>
              <Button
                onClick={openCart}
                className="h-14 px-10 rounded-2xl bg-gradient-to-r from-saffron to-saffron-600 text-white font-black shadow-xl shadow-saffron/20 hover:scale-105 transition-all flex items-center gap-3"
              >
                <ShoppingBag className="w-5 h-5" />
                View My Cart
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
