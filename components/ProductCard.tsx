import { memo } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/helpers';
import { useCart } from '@/lib/hooks/useCart';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { calculateDiscount } from '@/lib/helpers';
import type { Product } from '@/lib/types';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  showWishlist?: boolean;
}

const ProductCard = ({ product, showWishlist = true }: ProductCardProps) => {
  const { addToCart, openCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isFavorited = isInWishlist(product._id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      productId: product._id,
      title: product.title,
      price: product.discountPrice || product.price,
      quantity: 1,
      image: product.images[0],
    });

    toast.success('Added to cart');
    openCart();
  };

  const discount = product.discountPrice
    ? calculateDiscount(product.price, product.discountPrice)
    : 0;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-bhutan-xl transition-all duration-500 transform hover:-translate-y-2">
      {/* Image Container */}
      <Link href={`/products/${product._id}`} className="relative block aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-gray-300" />
          </div>
        )}

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {discount > 0 && (
            <span className="px-2.5 py-1 bg-gradient-to-r from-saffron to-saffron-600 text-white text-xs font-semibold rounded-lg shadow-lg animate-pulse-slow">
              -{discount}%
            </span>
          )}
          {product.isCustomizable && (
            <span className="px-2.5 py-1 bg-gradient-to-r from-bhutan-blue to-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-lg">
              <Sparkles className="w-3 h-3" />
              Custom
            </span>
          )}
          {product.isFeatured && (
            <span className="px-2.5 py-1 bg-gradient-to-r from-gold to-yellow-600 text-white text-xs font-semibold rounded-lg shadow-lg">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        {showWishlist && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={`absolute top-3 right-3 w-9 h-9 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg z-10 ${isFavorited
              ? 'bg-saffron text-white'
              : 'bg-white/90 text-gray-600 hover:bg-white'
              }`}
          >
            <Heart className={`w-4 h-4 transition-colors ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Quick Add Button */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
          <Button
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-saffron to-saffron-600 text-white hover:from-saffron-600 hover:to-saffron-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            disabled={product.stock === 0}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={`/products/${product._id}`}>
          <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-saffron transition-colors duration-300 mb-2">
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.round(product.ratings.average)
                  ? 'text-gold fill-gold'
                  : 'text-gray-300'
                  }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground ml-1">
            ({product.ratings.count})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg bg-gradient-to-r from-saffron to-maroon bg-clip-text text-transparent">
            {formatPrice(product.discountPrice || product.price)}
          </span>
          {product.discountPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {product.stock <= 5 && product.stock > 0 && (
          <p className="text-xs text-orange-600 mt-2 font-medium">
            Only {product.stock} left in stock!
          </p>
        )}
      </div>
    </div>
  );
};

export default memo(ProductCard);
