import logoImg from '@/lib/logo.png';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
} from 'lucide-react';

const Footer = () => {

  const footerLinks = {
    shop: [
      { name: 'All Products', href: '/products', color: 'saffron' },
      { name: 'Custom Products', href: '/products?customizable=true', color: 'saffron' },
      { name: 'Featured', href: '/products?featured=true', color: 'saffron' },
      { name: 'New Arrivals', href: '/products?sortBy=createdAt', color: 'saffron' },
    ],
    support: [
      { name: 'Contact Us', href: '/contact', color: 'bhutan-blue' },
      { name: 'About Us', href: '/about', color: 'bhutan-blue' },
      { name: 'FAQs', href: '/faq', color: 'bhutan-blue' },
      { name: 'Shipping Info', href: '/shipping', color: 'bhutan-blue' },
      { name: 'Terms & Conditions', href: '/terms-and-conditions', color: 'bhutan-blue' },
    ],
    company: [
      { name: 'About Us', href: '/about', color: 'bhutan-emerald' },
      { name: 'Our Blog', href: '/blog', color: 'bhutan-emerald' },
      { name: 'Gallery', href: '/gallery', color: 'bhutan-emerald' },
      { name: 'Careers', href: '/careers', color: 'bhutan-emerald' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/3B17699032', color: '#1877F2' },
    { name: 'WhatsApp', icon: MessageCircle, href: 'https://wa.me/message/SCNBPGPDXL4ZL1', color: '#25D366' },
    { name: 'Instagram', icon: Instagram, href: '#', color: '#E4405F' },
    { name: 'YouTube', icon: Youtube, href: '#', color: '#FF0000' },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-gray-950 via-[#2d0b14] to-black text-white overflow-hidden border-t border-white/10">
      {/* Immersive Background Layers */}
      <div className="absolute inset-0 mandala-pattern opacity-5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-maroon/20 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-saffron/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 animate-pulse-slow" />

      {/* Prayer flag decoration top border */}
      <div className="h-1.5 w-full flex opacity-80">
        <div className="flex-1 bg-bhutan-blue" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-maroon" />
        <div className="flex-1 bg-gold" />
        <div className="flex-1 bg-bhutan-emerald" />
      </div>

      <div className="bhutan-container relative z-10 pt-20 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-16 pb-16 border-b border-white/5">
          {/* Brand & Mission Section */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-4 mb-8 group inline-flex">
              <div className="relative">
                <img
                  src={logoImg}
                  alt="Our Store"
                  className="w-24 h-24 object-contain animate-float-subtle transform group-hover:scale-110 transition-all duration-500"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-display font-black tracking-tighter">Our Store</span>
                <span className="text-[10px] text-saffron font-bold tracking-[0.3em] uppercase opacity-70">Elevating Bhutanese Tech</span>
              </div>
            </Link>

            <p className="text-white/50 mb-10 max-w-sm text-lg leading-relaxed font-medium">
              We bridge the gap between traditional Bhutanese values and the modern digital horizon,
              offering curated tech with a heart.
            </p>

            {/* Contact Grid - Modern Glass Style */}
            <div className="grid grid-cols-1 gap-4">
              {[
                { icon: MapPin, text: 'Damphu, Tsirang. @ourstore.tech', color: 'saffron' },
                { icon: Phone, text: '+97517699032', color: 'bhutan-blue' },
                { icon: Mail, text: 'tsirang@ourstore.tech', color: 'bhutan-emerald' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 group cursor-pointer w-fit">
                  <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-${item.color}/10 group-hover:border-${item.color}/30 transition-all duration-300 backdrop-blur-md`}>
                    <item.icon className={`w-5 h-5 text-${item.color}`} />
                  </div>
                  <span className="text-white/60 group-hover:text-white transition-colors text-sm font-bold tracking-tight">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          {[
            { title: 'Shop', links: footerLinks.shop, accent: 'saffron' },
            { title: 'Support', links: footerLinks.support, accent: 'bhutan-blue' },
            { title: 'Company', links: footerLinks.company, accent: 'bhutan-emerald' }
          ].map((column) => (
            <div key={column.title} className="col-span-1">
              <h3 className="text-white font-display font-bold text-xl mb-8 flex items-center gap-3">
                <span className={`w-6 h-[3px] bg-${column.accent} rounded-full`} />
                {column.title}
              </h3>
              <ul className="space-y-4">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className={`text-white/40 hover:text-white transition-all duration-300 flex items-center gap-2 group transform hover:translate-x-2`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full bg-${column.accent}/0 group-hover:bg-${column.accent} transition-all duration-300`} />
                      <span className="font-bold text-sm tracking-tight">{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Panel - Ultra Modern Glass */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="glass-dark border border-white/10 px-8 py-3.5 rounded-full shadow-2xl backdrop-blur-xl group hover:border-white/20 transition-all duration-500">
            <p className="text-white/40 text-[10px] font-bold tracking-widest uppercase">
              Copyright &copy; [2022-2026] <span className="text-white font-black">ourstore.tech</span>. <span className="hidden sm:inline">Crafted for Excellence.</span>
            </p>
          </div>

          {/* Vibrant Tinted Glass Social System */}
          <div className="flex items-center gap-5">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-12 h-12 flex items-center justify-center transition-all duration-500"
                aria-label={social.name}
              >
                {/* Glow & Backdrop */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-25 blur-xl transition-all duration-500"
                  style={{ backgroundColor: social.color }}
                />
                <div
                  className="relative w-full h-full rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:-rotate-12 backdrop-blur-md group-hover:border-opacity-40"
                  style={{
                    borderColor: `${social.color}44`,
                    backgroundColor: `${social.color}08`
                  }}
                >
                  <social.icon
                    className="w-5 h-5 transition-all duration-500"
                    style={{ color: social.color }}
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
