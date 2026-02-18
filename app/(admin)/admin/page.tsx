'use client';

import { useEffect, useState } from 'react';
import {
    DollarSign,
    ShoppingBag,
    Users,
    Package,
    TrendingUp,
    TrendingDown,
    ArrowRight,
    AlertCircle,
    Activity,
    Calendar,
    MessageSquare,
    Clock
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { adminAPI } from '@/lib/services/api';
import { formatPrice } from '@/lib/helpers';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const AdminDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [dateRange, setDateRange] = useState({ label: 'Last 7 Days', from: '', to: '' });

    useEffect(() => {
        fetchStats();

        // Set up polling every 30 seconds
        const interval = setInterval(() => {
            fetchStats(false); // Silent fetch
        }, 30000);

        return () => clearInterval(interval);
    }, [dateRange]); // Refetch when dateRange changes

    const fetchStats = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const { from, to } = dateRange;
            const response = await adminAPI.getDashboardStats({ from, to });
            setStats(response.data);
            setLastUpdated(new Date());
        } catch (error) {
            if (showLoading) toast.error('Failed to load dashboard stats');
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const handleSelectRange = (range: string) => {
        const to = new Date();
        let from = new Date();

        switch (range) {
            case 'Today':
                from.setHours(0, 0, 0, 0);
                setDateRange({ label: 'Today', from: from.toISOString(), to: to.toISOString() });
                break;
            case 'Last 7 Days':
                from.setDate(to.getDate() - 7);
                setDateRange({ label: 'Last 7 Days', from: from.toISOString(), to: to.toISOString() });
                break;
            case 'Last 30 Days':
                from.setDate(to.getDate() - 30);
                setDateRange({ label: 'Last 30 Days', from: from.toISOString(), to: to.toISOString() });
                break;
            case 'All Time':
                setDateRange({ label: 'All Time', from: '', to: '' });
                break;
            default:
                break;
        }
        toast.success(`Dashboard filtered to ${range}`);
    };

    const handleSelectDateManual = () => {
        toast.info('Custom date picker integration is in progress. Using quick ranges for now.');
    };
    const handleGenerateReport = () => {
        if (!stats) return;

        const reportData = [
            ['Metric', 'Value'],
            ['Total Revenue', stats.totalRevenue],
            ['Total Orders', stats.totalOrders],
            ['Total Users', stats.totalUsers],
            ['Total Products', stats.totalProducts],
            ['', ''],
            ['Recent Activity Log', ''],
            ['Time', 'User', 'Title', 'Type'],
            ...(stats.recentActivity || []).map((a: any) => [
                new Date(a.time).toLocaleString(),
                a.user,
                a.title,
                a.type
            ])
        ];

        const csvContent = "data:text/csv;charset=utf-8,"
            + reportData.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `dashboard_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Report generated successfully');
    };


    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center h-[70vh]">
                <div className="relative">
                    <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-saffron animate-spin"></div>
                    <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-maroon animate-spin absolute top-0 left-0 scale-75 opacity-50"></div>
                </div>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Revenue',
            value: formatPrice(stats?.totalRevenue || 0),
            icon: DollarSign,
            trend: '+12.5%',
            trendUp: true,
            color: 'bg-emerald-500',
            lightColor: 'bg-emerald-50 text-emerald-600',
        },
        {
            title: 'Success Orders',
            value: stats?.totalOrders || 0,
            icon: ShoppingBag,
            trend: '+8.2%',
            trendUp: true,
            color: 'bg-saffron',
            lightColor: 'bg-saffron/10 text-saffron',
        },
        {
            title: 'Active Users',
            value: stats?.totalUsers || 0,
            icon: Users,
            trend: '+15.1%',
            trendUp: true,
            color: 'bg-blue-500',
            lightColor: 'bg-blue-50 text-blue-600',
        },
        {
            title: 'Total Products',
            value: stats?.totalProducts || 0,
            icon: Package,
            trend: '-2.4%',
            trendUp: false,
            color: 'bg-purple-500',
            lightColor: 'bg-purple-50 text-purple-600',
        },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight">Executive Dashboard</h1>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-600 rounded-full border border-green-100 animate-pulse">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                            <span className="text-[10px] font-black uppercase tracking-wider">Live</span>
                        </div>
                    </div>
                    <p className="text-gray-500 font-medium tracking-wide">
                        Last data pulse: <span className="text-gray-900 font-bold">{lastUpdated.toLocaleTimeString()}</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="rounded-2xl border-gray-200 h-11 flex gap-2 min-w-[150px]"
                            >
                                <Calendar className="w-4 h-4" />
                                {dateRange.label}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="rounded-2xl p-2 w-48 shadow-2xl border-gray-100">
                            {['Today', 'Last 7 Days', 'Last 30 Days', 'All Time'].map((range) => (
                                <DropdownMenuItem
                                    key={range}
                                    onClick={() => handleSelectRange(range)}
                                    className="rounded-xl p-3 focus:bg-saffron/10 focus:text-saffron cursor-pointer font-bold text-xs uppercase"
                                >
                                    {range}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleSelectDateManual}
                                className="rounded-xl p-3 focus:bg-saffron/10 focus:text-saffron cursor-pointer font-bold text-xs uppercase opacity-50"
                            >
                                Custom Range...
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        onClick={handleGenerateReport}
                        className="rounded-2xl bg-maroon hover:bg-maroon/90 h-11 px-6 shadow-xl shadow-maroon/20"
                    >
                        Generate Report
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <Card key={stat.title} className="border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2.5rem] group overflow-hidden bg-white">
                        <CardContent className="p-8">
                            <div className="flex items-start justify-between mb-8">
                                <div className={`w-14 h-14 rounded-3xl ${stat.lightColor} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                                    <stat.icon className="w-7 h-7" />
                                </div>
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${stat.trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                    {stat.trendUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                    {stat.trend}
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.15em] mb-1">{stat.title}</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-black text-gray-900">{stat.value}</h3>
                                </div>
                            </div>

                            {/* Decorative background element */}
                            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${stat.color} opacity-[0.03] group-hover:scale-150 transition-transform duration-700`} />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Section */}
                <Card className="lg:col-span-2 border-none shadow-sm rounded-[3rem] bg-white overflow-hidden p-2">
                    <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight">Revenue Analytics</CardTitle>
                            <p className="text-gray-400 text-sm mt-1">Daily revenue performance for current period</p>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border">
                            <Button variant="ghost" size="sm" className="rounded-xl h-8 bg-white shadow-sm text-xs font-bold">Week</Button>
                            <button className="text-xs px-4 py-1.5 text-gray-400 font-bold hover:text-gray-600">Month</button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-10">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats?.salesHistory || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#800000" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#800000" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                                    <XAxis
                                        dataKey="_id"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }}
                                        dy={15}
                                        tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: 'short' })}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }}
                                        tickFormatter={(val) => `Nu ${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '15px' }}
                                        labelStyle={{ fontWeight: 'bold', marginBottom: '5px', color: '#111' }}
                                        cursor={{ stroke: '#800000', strokeWidth: 2, strokeDasharray: '4 4' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#800000"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Low Stock Widget */}
                    <Card className="border-none shadow-sm rounded-[3rem] bg-white overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-bold flex items-center gap-2 tracking-tight">
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                    Inventory Watch
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-4">
                            {stats?.lowStockItems?.length > 0 ? (
                                stats.lowStockItems.map((item: any) => (
                                    <div key={item._id} className="flex items-center gap-4 group cursor-pointer hover:bg-gray-50 p-2 rounded-2xl transition-all duration-300 -mx-2">
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shadow-sm">
                                            {item.images[0] ? (
                                                <div className="relative w-full h-full">
                                                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={16} /></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-bold text-gray-900 truncate">{item.title}</h4>
                                            <p className="text-[10px] font-black text-red-500 uppercase tracking-tighter">{item.stock} LEFT</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400 text-xs text-center py-4 font-bold uppercase tracking-widest">Stock Health Good</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Live Activity Feed */}
                    <Card className="border-none shadow-sm rounded-[3rem] bg-white overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2 tracking-tight">
                                <Activity className="w-5 h-5 text-maroon" />
                                Live System Log
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            <div className="space-y-6">
                                {stats?.recentActivity?.length > 0 ? (
                                    stats.recentActivity.map((activity: any, idx: number) => (
                                        <div key={idx} className="flex gap-4 relative">
                                            {idx !== stats.recentActivity.length - 1 && (
                                                <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-100" />
                                            )}
                                            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${activity.type === 'order' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                                                }`}>
                                                {activity.type === 'order' ? <ShoppingBag size={18} /> : <MessageSquare size={18} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 line-clamp-1">{activity.title}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase">{activity.user}</span>
                                                    <span className="text-[10px] text-gray-300">•</span>
                                                    <span className="flex items-center gap-1 text-[10px] text-gray-400">
                                                        <Clock size={10} />
                                                        {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-xs text-center py-4">No recent activity</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Recent Orders Table - Modernized */}
            <Card className="border-none shadow-sm rounded-[3rem] bg-white overflow-hidden">
                <CardHeader className="p-10 pb-6 flex flex-row items-center justify-between sticky top-0 bg-white z-10 border-b border-gray-50">
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tight">Processing Orders</CardTitle>
                        <p className="text-gray-400 text-sm mt-1">Real-time stream of incoming purchase orders</p>
                    </div>
                    <Button variant="ghost" className="text-maroon font-bold gap-2 hover:bg-maroon/5 rounded-xl">
                        See all transactions
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] py-5 px-10 text-left">Internal ID</th>
                                    <th className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] py-5 px-10 text-left">Client Entity</th>
                                    <th className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] py-5 px-10 text-left">Timestamp</th>
                                    <th className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] py-5 px-10 text-left">Gross Value</th>
                                    <th className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] py-5 px-10 text-left text-center">Status Badge</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {stats?.recentOrders?.map((order: any) => (
                                    <tr key={order._id} className="group hover:bg-gray-50/80 transition-all duration-300">
                                        <td className="py-6 px-10">
                                            <span className="text-sm font-black text-gray-900 bg-gray-100 px-3 py-1.5 rounded-xl group-hover:bg-white group-hover:shadow-sm transition-all">#{order.orderNumber}</span>
                                        </td>
                                        <td className="py-6 px-10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-black text-gray-500 shadow-inner">
                                                    {order.userId?.fullName?.charAt(0) || 'G'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 leading-tight">{order.userId?.fullName || 'Guest Client'}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{order.userId?.email || 'External Checkout'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-10 text-sm font-medium text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="py-6 px-10 font-black text-gray-900">
                                            {formatPrice(order.total)}
                                        </td>
                                        <td className="py-6 px-10 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.orderStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                order.orderStatus === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                    'bg-blue-50 text-blue-600 border border-blue-100'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${order.orderStatus === 'Delivered' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                                    order.orderStatus === 'Pending' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                                                        'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                                                    }`} />
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDashboard;
