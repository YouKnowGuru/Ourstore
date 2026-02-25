'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Search, User, ChevronDown, Settings, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/hooks/useAuth';
import { adminAPI } from '@/lib/services/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const AdminHeader = () => {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState<'online' | 'checking' | 'error'>('checking');

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await adminAPI.getDashboardStats();
        setUnreadCount(response.data.unreadMessagesCount || 0);
        setNotifications(response.data.recentActivity || []);
        setSystemStatus('online');
      } catch (error) {
        setSystemStatus('error');
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 45000); // Polling every 45s for notifications

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center flex-1 max-w-xl group relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-4 group-focus-within:text-saffron transition-colors" />
        <Input
          placeholder="Ctrl + K to search orders, products..."
          className="pl-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-4 focus:ring-saffron/10 focus:border-saffron h-11 rounded-2xl transition-all"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest mr-4">
          <span className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full shadow-glow ${systemStatus === 'online' ? 'bg-green-500' :
              systemStatus === 'error' ? 'bg-red-500' : 'bg-amber-500'
              }`} />
            {systemStatus === 'online' ? 'System Online' :
              systemStatus === 'error' ? 'Connection Issue' : 'Syncing...'}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative w-11 h-11 bg-gray-50 flex items-center justify-center rounded-2xl hover:bg-gray-100 transition-colors group outline-none">
              <Bell className="w-5 h-5 text-gray-600 group-hover:scale-110 transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 mt-2 rounded-2xl p-0 shadow-2xl border-gray-100 overflow-hidden">
            <div className="p-3 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
              <DropdownMenuLabel className="p-0 text-xs text-gray-400 uppercase font-bold tracking-widest">Notifications</DropdownMenuLabel>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} New
                </span>
              )}
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification: any, index: number) => (
                  <DropdownMenuItem
                    key={index}
                    asChild
                    className="p-4 border-b border-gray-50 focus:bg-gray-50 cursor-pointer gap-3 last:border-0"
                  >
                    <Link href={notification.type === 'order' ? '/admin/orders' : '/admin/messages'} className="flex items-start gap-3 w-full">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notification.type === 'order' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                        {notification.type === 'order' ? (
                          <span className="font-bold text-xs">₹</span>
                        ) : (
                          <Bell className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{notification.title}</p>
                        <p className="text-xs text-gray-500 truncate">{notification.user} • {new Date(notification.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      {index < unreadCount && (
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-xs font-medium">No new notifications</p>
                </div>
              )}
            </div>
            <div className="p-2 bg-gray-50/50 border-t border-gray-100 text-center">
              <Link href="/admin" className="text-[10px] font-bold text-maroon hover:underline uppercase tracking-wider">
                View All Activity
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 pl-2 pr-4 py-1.5 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200 group">
              <div className="relative">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-xl object-cover shadow-sm ring-2 ring-white"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-maroon to-maroon/80 flex items-center justify-center shadow-sm">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-gray-900 group-hover:text-maroon transition-colors leading-tight">{user?.fullName}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-tighter font-extrabold">{user?.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-all" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl p-2 shadow-2xl border-gray-100">
            <DropdownMenuLabel className="px-3 py-2 text-xs text-gray-400 uppercase font-bold tracking-widest">Administrator</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="rounded-xl p-3 focus:bg-saffron/10 focus:text-saffron-700 cursor-pointer gap-3">
              <Link href="/profile" className="flex items-center gap-3 w-full">
                <User className="w-4 h-4" />
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">Account Settings</span>
                  <span className="text-[10px] opacity-70">Manage your credentials</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl p-3 focus:bg-saffron/10 focus:text-saffron-700 cursor-pointer gap-3">
              <Settings className="w-4 h-4" />
              <div className="flex flex-col">
                <span className="font-semibold text-sm">Console Prefs</span>
                <span className="text-[10px] opacity-70">UI and Notifications</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="rounded-xl p-3 focus:bg-red-50 text-red-600 cursor-pointer gap-3"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-bold">Log out Console</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AdminHeader;
