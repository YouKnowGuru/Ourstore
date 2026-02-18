import logoImg from '@/lib/logo.png';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Search,
  ShoppingCart,
  User,
  Heart,
  Menu,
  X,
  LogOut,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { selectCartCount } from '@/store/slices/cartSlice';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { toggleCartDrawer } = useCart();
  const { wishlist } = useWishlist();
  const cartCount = useSelector(selectCartCount);
  const wishlistCount = wishlist.length;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
  ];

  const serviceLinks = [
    { name: 'Sale Deed', href: 'https://saledeed-kappa.vercel.app/' },
    { name: 'Photo Editor', href: 'https://druckphoyoeditor.vercel.app/' },
  ];

  const otherLinks = [
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${isScrolled ? 'py-4' : 'py-0'
        }`}
    >
      <div className={`bhutan-container transition-all duration-700 ${isScrolled ? 'max-w-6xl' : 'max-w-full'}`}>
        <div
          className={`relative flex items-center justify-between transition-all duration-700 px-6 md:px-10 ${isScrolled
            ? 'glass shadow-glow-lg rounded-full h-16 border border-white/20'
            : 'bg-white/80 backdrop-blur-md h-20 md:h-24 border-b border-gray-100'
            }`}
        >
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 group relative flex-shrink-0 animate-fade-in">
            <div className="relative flex items-center justify-center">
              <img
                src={logoImg}
                alt="Our Store"
                className="w-16 h-16 md:w-20 md:h-20 object-contain animate-float-subtle transform group-hover:scale-110 transition-all duration-500"
              />
            </div>
            <span className="text-xl md:text-2xl font-display font-black tracking-tighter bg-gradient-to-r from-maroon via-maroon-800 to-saffron bg-clip-text text-transparent hidden sm:block transition-all duration-500 group-hover:tracking-tight">
              Our Store
            </span>
          </Link>

          {/* Search Bar - Reorganized for better spacing */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center flex-1 max-w-lg mx-6 lg:mx-12 group animate-fade-in"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search premium products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 rounded-full border border-gray-200/50 focus:border-saffron/50 focus:ring-4 focus:ring-saffron/10 outline-none text-sm transition-all duration-500 bg-gray-50/50 backdrop-blur-sm group-hover:bg-white"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-saffron transition-colors duration-500" />
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1 flex-shrink-0 mr-8 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="relative px-4 py-2 text-sm font-bold text-gray-700 group flex flex-col items-center"
              >
                <span className="relative z-10 group-hover:text-maroon transition-colors duration-300">{link.name}</span>
                <span className="absolute bottom-1 w-0 h-[2px] bg-gradient-to-r from-maroon to-saffron transition-all duration-300 group-hover:w-6 rounded-full" />
              </Link>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative px-4 py-2 text-sm font-bold text-gray-700 group flex items-center gap-1 hover:text-maroon transition-colors outline-none">
                  <span>Services</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-maroon transition-colors" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 glass border-white/20 p-2 shadow-2xl rounded-2xl animate-scale-in">
                {serviceLinks.map((service) => (
                  <DropdownMenuItem
                    key={service.name}
                    className="rounded-xl hover:bg-saffron/5 cursor-pointer"
                    asChild
                  >
                    <a href={service.href} target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
                      <span className="font-medium">{service.name}</span>
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {otherLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="relative px-4 py-2 text-sm font-bold text-gray-700 group flex flex-col items-center"
              >
                <span className="relative z-10 group-hover:text-maroon transition-colors duration-300">{link.name}</span>
                <span className="absolute bottom-1 w-0 h-[2px] bg-gradient-to-r from-maroon to-saffron transition-all duration-300 group-hover:w-6 rounded-full" />
              </Link>
            ))}
          </nav>

          {/* Actions Section */}
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0 animate-fade-in">
            {/* Wishlist */}
            {isAuthenticated && (
              <Link
                to="/wishlist"
                className="hidden md:flex p-2.5 hover:bg-saffron/5 rounded-xl transition-all duration-300 group border border-transparent hover:border-saffron/10 relative"
              >
                <Heart className="w-5 h-5 text-gray-700 group-hover:text-maroon transition-colors" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-maroon text-white text-[8px] rounded-full flex items-center justify-center font-black shadow-sm ring-2 ring-white animate-bounce-in">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1 border border-gray-100 hover:border-saffron/30 rounded-full transition-all duration-300 bg-white/50 backdrop-blur-sm">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.fullName}
                        className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover shadow-sm"
                      />
                    ) : (
                      <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-maroon to-maroon-800 flex items-center justify-center shadow-sm">
                        <span className="text-white text-xs md:text-sm font-black">
                          {user?.fullName?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <ChevronDown className="w-4 h-4 text-gray-400 mr-1 hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass border-white/20 p-2 shadow-2xl rounded-2xl animate-scale-in">
                  <div className="px-3 py-3 border-b border-gray-100 mb-1">
                    <p className="font-black text-sm text-gray-900">{user?.fullName}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{user?.email}</p>
                  </div>
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-xl hover:bg-saffron/5">
                    <User className="w-4 h-4 mr-3 text-maroon" />
                    <span className="font-medium">My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')} className="rounded-xl hover:bg-saffron/5">
                    <ShoppingCart className="w-4 h-4 mr-3 text-saffron" />
                    <span className="font-medium">Order History</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-100 my-1" />
                  <DropdownMenuItem onClick={logout} className="rounded-xl text-red-600 hover:bg-red-50">
                    <LogOut className="w-4 h-4 mr-3" />
                    <span className="font-black">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full font-bold hover:bg-maroon/5 text-gray-700"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  className="bg-maroon hover:bg-maroon-800 rounded-full font-black px-6 shadow-glow transition-all duration-300 hover:scale-105"
                  onClick={() => navigate('/register')}
                >
                  Join Us
                </Button>
              </div>
            )}

            {/* Cart Button - The Glow Accent */}
            <button
              onClick={toggleCartDrawer}
              className="relative p-3 bg-gradient-to-br from-saffron to-saffron-600 rounded-full transition-all duration-500 group shadow-lg hover:shadow-glow-saffron transform hover:-translate-y-1 hover:scale-105"
            >
              <ShoppingCart className="w-5 h-5 text-white transition-transform duration-500 group-hover:rotate-12" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 bg-maroon border-2 border-white text-white text-[10px] rounded-full flex items-center justify-center font-black shadow-lg animate-bounce-in">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-3 hover:bg-gray-100 rounded-full transition-all duration-300 active:scale-95"
            >
              <div className="relative w-5 h-5 overflow-hidden">
                <div className={`absolute inset-0 transition-transform duration-500 ${isMobileMenuOpen ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
                  <Menu className="w-5 h-5 text-gray-700" />
                </div>
                <div className={`absolute inset-0 transition-transform duration-500 ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                  <X className="w-5 h-5 text-maroon" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overhaul */}
      <div
        className={`xl:hidden fixed inset-x-0 top-[72px] transition-all duration-700 ease-in-out ${isMobileMenuOpen
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : '-translate-y-10 opacity-0 pointer-events-none'
          }`}
      >
        <div className="bhutan-container px-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 backdrop-blur-3xl">
            <nav className="space-y-2 mb-6 max-h-[60vh] overflow-y-auto pr-2">
              {navLinks.map((link, idx) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all group"
                  style={{ transitionDelay: `${idx * 50}ms` }}
                >
                  <span className="text-lg font-bold text-gray-800 group-hover:text-maroon transition-colors">{link.name}</span>
                  <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-maroon/10 flex items-center justify-center transition-colors">
                    <ChevronDown className="w-4 h-4 -rotate-90 group-hover:text-maroon transition-colors" />
                  </div>
                </Link>
              ))}

              <div className="p-4 space-y-3">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Professional Services</p>
                <div className="grid grid-cols-1 gap-2">
                  {serviceLinks.map((service, idx) => (
                    <a
                      key={service.name}
                      href={service.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 hover:bg-saffron/5 border border-stone-100 transition-all group"
                      style={{ transitionDelay: `${(navLinks.length + idx) * 50}ms` }}
                    >
                      <span className="font-bold text-gray-800 group-hover:text-saffron transition-colors">{service.name}</span>
                      <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-saffron transition-all" />
                    </a>
                  ))}
                </div>
              </div>

              {otherLinks.map((link, idx) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all group"
                  style={{ transitionDelay: `${(navLinks.length + serviceLinks.length + idx) * 50}ms` }}
                >
                  <span className="text-lg font-bold text-gray-800 group-hover:text-maroon transition-colors">{link.name}</span>
                  <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-maroon/10 flex items-center justify-center transition-colors">
                    <ChevronDown className="w-4 h-4 -rotate-90 group-hover:text-maroon transition-colors" />
                  </div>
                </Link>
              ))}
            </nav>

            {!isAuthenticated && (
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="rounded-2xl h-14 font-bold border-gray-200"
                  onClick={() => {
                    navigate('/login');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Sign In
                </Button>
                <Button
                  className="bg-maroon hover:bg-maroon-800 rounded-2xl h-14 font-black shadow-lg shadow-maroon/20"
                  onClick={() => {
                    navigate('/register');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
