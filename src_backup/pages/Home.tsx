import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Truck, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
// formatPrice imported for future use
import ProductCard from '@/components/ProductCard';
import AnimatedProductIcons from '@/components/AnimatedProductIcons';
import AnimatedCategoryIcon from '@/components/AnimatedCategoryIcon';
import BackToTop from '@/components/BackToTop';
import { CATEGORIES } from '@/constants/categories';
import { ModernTypingText } from '@/components/ModernTypingText';
import ResumeBuilderBanner from '@/components/ResumeBuilderBanner';

const Home = () => {
  const { featuredProducts, getFeaturedProducts } = useProducts();

  useEffect(() => {
    getFeaturedProducts();
  }, []);

  const features = [
    {
      icon: Sparkles,
      title: 'Custom Products',
      description: 'Personalize your items with our custom printing services',
    },
    {
      icon: Shield,
      title: 'Quality Guaranteed',
      description: 'All products come with our quality assurance promise',
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery across Bhutan',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Our team is always here to help you',
    },
  ];

  const categories = CATEGORIES;

  return (
    <div className="pt-20">
      <BackToTop />
      {/* Hero Section */}
      <section className="relative min-h-[700px] flex items-center overflow-hidden">
        {/* Enhanced Background with Gradient Mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0B15] via-[#1A103C] to-[#2D0F35]">
          {/* Floating Orbs */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-purple-600 blur-3xl animate-float" />
            <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-blue-600 blur-3xl float-slow" />
            <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-pink-600 blur-3xl float-medium" />
          </div>
          {/* Gradient Mesh Overlay */}
          <div className="absolute inset-0 gradient-mesh opacity-30" />
        </div>

        <div className="bhutan-container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-8 animate-slide-in-right">
              {/* Modern Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-dark backdrop-blur-lg animate-bounce-in">
                <Sparkles className="w-4 h-4 text-saffron animate-pulse" />
                <span className="text-sm font-medium">Bhutan's Premier Tech Store</span>
              </div>

              {/* Headline with Gradient */}
              <div className="min-h-[180px] flex flex-col justify-center">
                <ModernTypingText
                  text="Quality Tech Products"
                  className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight text-white/90 drop-shadow-lg"
                  speed={100}
                  deleteSpeed={40}
                  pause={3000}
                  loop={true}
                  cursor={true}
                />

                <div className="relative mt-4">
                  <div className="bg-gradient-to-r from-[#00ffff] via-[#ff00ff] to-[#ffff00] bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_auto] text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-wide drop-shadow-[0_0_25px_rgba(0,255,255,0.3)] animate-float">
                    & Custom Services
                  </div>
                </div>
              </div>

              <p className="text-lg md:text-xl text-white/90 max-w-lg leading-relaxed">
                Discover our wide range of electronics, custom photo products, and
                professional printing services with authentic Bhutanese hospitality.
              </p>

              {/* Modern CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-saffron to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white shadow-2xl hover:shadow-glow-lg transform hover:scale-105 transition-all duration-300 px-8 py-6 text-base"
                  asChild
                >
                  <Link to="/products">
                    Shop Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-white/80 text-white hover:bg-white/20 backdrop-blur-sm shadow-xl transform hover:scale-105 transition-all duration-300 px-8 py-6 text-base"
                  asChild
                >
                  <Link to="/products?customizable=true">
                    Custom Products
                  </Link>
                </Button>
              </div>
            </div>

            {/* Animated Product Icons */}
            <div className="hidden lg:block">
              <AnimatedProductIcons />
            </div>
          </div>
        </div>
      </section>

      <ResumeBuilderBanner />

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-white to-bhutan-cream/30 relative overflow-hidden">
        {/* SVG Gradients for Features */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id="feat-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#FF00FB', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#4200FF', stopOpacity: 1 }} />
            </linearGradient>
            <linearGradient id="feat-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#00F0FF', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#0047FF', stopOpacity: 1 }} />
            </linearGradient>
            <linearGradient id="feat-grad-3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#FF005C', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#FFBD00', stopOpacity: 1 }} />
            </linearGradient>
            <linearGradient id="feat-grad-4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#61FF00', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#00FFF0', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
        </svg>

        {/* Ambient background orbs for section */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#7000FF]/5 blur-[80px] rounded-full -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#00F0FF]/5 blur-[100px] rounded-full translate-x-1/2" />

        <div className="bhutan-container relative z-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative p-10 rounded-[2.5rem] bg-white border border-gray-100 hover:border-white/50 transition-all duration-700 shadow-xl hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] transform hover:-translate-y-3"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Modern Icon with Iridescent Glow */}
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <div className="absolute inset-0 opacity-20 blur-2xl group-hover:opacity-40 transition-all duration-700 rounded-2xl"
                    style={{ background: `linear-gradient(135deg, ${['#FF00FB', '#00F0FF', '#FF005C', '#61FF00'][index]}, transparent)` }}
                  />
                  <div
                    className="relative h-full w-full rounded-2xl flex items-center justify-center border transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 shadow-lg backdrop-blur-xl"
                    style={{
                      background: `rgba(255, 255, 255, 0.4)`,
                      backgroundColor: `${['#FF00FB', '#00F0FF', '#FF005C', '#61FF00'][index]}0D`,
                      borderColor: `${['#FF00FB', '#00F0FF', '#FF005C', '#61FF00'][index]}33`
                    }}
                  >
                    <feature.icon
                      className="w-10 h-10 transition-colors duration-500 animate-pulse-slow"
                      style={{ stroke: `url(#feat-grad-${index + 1})` }}
                    />
                  </div>
                </div>

                <h3 className="font-display font-bold text-xl mb-4 text-gray-900 group-hover:bg-gradient-to-r from-gray-900 to-gray-500 bg-clip-text group-hover:text-transparent transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed group-hover:text-gray-600 transition-colors duration-300">
                  {feature.description}
                </p>

                {/* Decorative bottom line */}
                <div
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full opacity-20 group-hover:w-16 group-hover:opacity-100 transition-all duration-700"
                  style={{ background: `linear-gradient(90deg, ${['#FF00FB', '#00F0FF', '#FF005C', '#61FF00'][index]}, #fff)` }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white mandala-pattern">
        <div className="bhutan-container">
          <div className="text-center mb-14 animate-slide-in-up">
            <h2 className="text-4xl font-display font-bold mb-5 bg-gradient-to-r from-maroon via-saffron to-gold bg-clip-text text-transparent">
              Shop by Category
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Browse our wide selection of products across different categories
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                to={category.href}
                className="group relative overflow-hidden rounded-3xl aspect-[4/5] shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 bg-white border border-gray-100"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Animated Category Icon */}
                <AnimatedCategoryIcon categoryName={category.name} />

                {/* Submit Arrow */}
                <div className="absolute bottom-6 right-6 p-3 rounded-full bg-gray-50 group-hover:bg-saffron transition-colors duration-300 shadow-sm">
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
                </div>

                {/* Content */}
                <div className="absolute bottom-6 left-6 right-16 flex flex-col">
                  <span className="text-gray-900 font-bold text-lg leading-tight group-hover:text-saffron transition-colors duration-300">
                    {category.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="bhutan-container">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-display font-bold mb-2">
                Featured Products
              </h2>
              <p className="text-muted-foreground">
                Handpicked items just for you
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/products">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {featuredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No featured products available</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-maroon">
        <div className="bhutan-container">
          <div className="text-center text-white space-y-6">
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Need Custom Products?
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              We offer personalized photo frames, t-shirt printing, and more.
              Create unique gifts for your loved ones or promote your business.
            </p>
            <Button
              size="lg"
              className="bg-saffron hover:bg-saffron-600"
              asChild
            >
              <Link to="/products?customizable=true">
                Explore Custom Products
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div >
  );
};

export default Home;
