'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Box,
  ShoppingCart,
  Users,
  Settings,
  FileText,
  Image,
  MessageSquare,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

const AdminSidebar = () => {
  const { logout } = useAuth();
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Box, label: 'Products', path: '/admin/products' },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: MessageSquare, label: 'Messages', path: '/admin/messages' },
    { icon: FileText, label: 'Blogs', path: '/admin/blogs' },
    { icon: Image, label: 'Gallery', path: '/admin/gallery' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="w-72 bg-[#1a1c23] h-screen flex flex-col fixed left-0 top-0 z-50 shadow-2xl overflow-hidden border-r border-white/5">
      {/* Brand Header */}
      <div className="h-24 flex items-center px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
            <img
              src="/images/logo.png"
              alt="Our Store"
              className="w-16 h-16 object-contain animate-float-subtle"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-xl tracking-tight text-white">Our Store</span>
            <span className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Admin Console</span>
          </div>
        </Link>
      </div>

      {/* Navigation section */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-none">
        <p className="px-4 mb-4 text-[11px] font-bold text-white/30 uppercase tracking-[0.2em]">Management</p>
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.label}
                href={item.path}
                className={`flex items-center justify-between group px-4 py-3.5 rounded-2xl transition-all duration-300 ${isActive
                  ? 'bg-saffron text-white shadow-xl shadow-saffron/20'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-white/20' : 'bg-transparent'}`}>
                    <item.icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                  </div>
                  <span className={`font-medium tracking-wide ${isActive ? 'text-white' : ''}`}>{item.label}</span>
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white mr-1 shadow-glow" />}
                {!isActive && <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/30 group-hover:translate-x-1 transition-all" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout area */}
      <div className="p-6 m-4 mt-auto rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-red-100/60 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="font-semibold tracking-wide">Secure Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
