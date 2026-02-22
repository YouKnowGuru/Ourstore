'use client';

import { useEffect, useState, Fragment } from 'react';
import { Eye, Package, Truck, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { orderAPI } from '@/lib/services/api';
import { formatPrice, formatDate, getOrderStatusColor, getPaymentStatusColor } from '@/lib/helpers';
import { toast } from 'sonner';

const AdminOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const toggleExpand = (id: string) => {
        setExpandedOrderId(expandedOrderId === id ? null : id);
    };

    const fetchOrders = async () => {
        try {
            const response = await orderAPI.getOrders({ limit: 100 });
            setOrders(response.data.orders);
        } catch (error) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        setUpdatingOrderId(id);
        try {
            await orderAPI.updateOrderStatus(id, { orderStatus: status });
            toast.success(`Order marked as ${status}`);
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-display font-bold">Manage Orders</h1>
                <div className="flex gap-2">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        {orders.filter(o => o.orderStatus === 'Pending').length} New
                    </Badge>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="text-left py-4 px-4 font-semibold text-gray-600">Order ID</th>
                            <th className="text-left py-4 px-4 font-semibold text-gray-600">Customer</th>
                            <th className="text-left py-4 px-4 font-semibold text-gray-600">Date & Amount</th>
                            <th className="text-left py-4 px-4 font-semibold text-gray-600">Status</th>
                            <th className="text-center py-4 px-4 font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {orders.map((order) => (
                            <Fragment key={order._id}>
                                <tr className={`hover:bg-gray-50/50 transition-colors ${expandedOrderId === order._id ? 'bg-indigo-50/30' : ''}`}>
                                    <td className="py-4 px-4">
                                        <div className="flex flex-col">
                                            <span className="font-mono font-bold text-gray-900">{order.orderNumber}</span>
                                            <span className="text-[10px] text-gray-400 uppercase tracking-wider">{order.paymentMethod}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-800">
                                                {order.isGuest ? order.guestInfo?.fullName : order.userId?.fullName}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {order.isGuest ? order.guestInfo?.phone : order.userId?.phone}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex flex-col">
                                            <span className="text-gray-700 font-medium">{formatPrice(order.total)}</span>
                                            <span className="text-xs text-gray-400">{formatDate(order.createdAt)}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex flex-col gap-1.5">
                                            <Badge className={`${getOrderStatusColor(order.orderStatus)} text-[10px] px-2 py-0.5 w-fit border-none shadow-none uppercase font-bold`}>
                                                {order.orderStatus}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => toggleExpand(order._id)}
                                                className={`p-2 rounded-lg transition-colors ${expandedOrderId === order._id ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100 text-gray-500'}`}
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>

                                            <div className="h-6 w-px bg-gray-200 mx-1" />

                                            {order.orderStatus === 'Pending' && (
                                                <button
                                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-shadow shadow-sm active:shadow-none disabled:opacity-50"
                                                    onClick={() => updateStatus(order._id, 'Processing')}
                                                    disabled={updatingOrderId === order._id}
                                                >
                                                    {updatingOrderId === order._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Package className="w-3.5 h-3.5" />}
                                                    Confirm
                                                </button>
                                            )}
                                            {order.orderStatus === 'Processing' && (
                                                <button
                                                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-shadow shadow-sm active:shadow-none disabled:opacity-50"
                                                    onClick={() => updateStatus(order._id, 'Shipped')}
                                                    disabled={updatingOrderId === order._id}
                                                >
                                                    {updatingOrderId === order._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />}
                                                    Ship
                                                </button>
                                            )}
                                            {order.orderStatus === 'Shipped' && (
                                                <button
                                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-shadow shadow-sm active:shadow-none disabled:opacity-50"
                                                    onClick={() => updateStatus(order._id, 'Delivered')}
                                                    disabled={updatingOrderId === order._id}
                                                >
                                                    {updatingOrderId === order._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                                    Deliver
                                                </button>
                                            )}
                                            {order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
                                                <button
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                    onClick={() => updateStatus(order._id, 'Cancelled')}
                                                    disabled={updatingOrderId === order._id}
                                                    title="Cancel Order"
                                                >
                                                    {updatingOrderId === order._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                {expandedOrderId === order._id && (
                                    <tr className="bg-gray-50/80">
                                        <td colSpan={5} className="py-6 px-8 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                                                <div className="space-y-4">
                                                    <div className="space-y-3">
                                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                                            <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                                                            Shipping Address
                                                        </h3>
                                                        <div className="text-gray-600 space-y-1 pl-3.5 border-l border-gray-200">
                                                            <p className="font-semibold text-gray-800">{order.shippingAddress.fullName}</p>
                                                            <p>{order.shippingAddress.phone}</p>
                                                            <p>{order.shippingAddress.addressLine1}</p>
                                                            {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                                                            <p>{order.shippingAddress.city}, {order.shippingAddress.dzongkhag}</p>
                                                            <p className="text-gray-400 text-xs">{order.shippingAddress.postalCode}</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                                            <div className="w-1.5 h-4 bg-green-500 rounded-full" />
                                                            Payment Info
                                                        </h3>
                                                        <div className="pl-3.5 border-l border-gray-200">
                                                            <Badge className={`${getPaymentStatusColor(order.paymentStatus)} text-[10px] px-2 py-0.5 w-fit border-none shadow-none uppercase font-bold`}>
                                                                {order.paymentStatus}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-3 md:col-span-2">
                                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                                        <div className="w-1.5 h-4 bg-saffron rounded-full" />
                                                        Order Items & Summary
                                                    </h3>
                                                    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                                                        <div className="divide-y divide-gray-50">
                                                            {order.items.map((item: any) => (
                                                                <div key={item._id} className="flex justify-between items-center py-2.5 px-4 hover:bg-gray-50/50">
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium text-gray-800">{item.title}</span>
                                                                        <span className="text-xs text-gray-500">{formatPrice(item.price)} × {item.quantity}</span>
                                                                    </div>
                                                                    <span className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="bg-gray-50/50 p-4 space-y-2 border-t border-gray-100">
                                                            <div className="flex justify-between text-xs text-gray-500">
                                                                <span>Subtotal</span>
                                                                <span>{formatPrice(order.subtotal)}</span>
                                                            </div>
                                                            <div className="flex justify-between text-xs text-gray-500">
                                                                <span>Shipping Fee</span>
                                                                <span>{formatPrice(order.shippingFee)}</span>
                                                            </div>
                                                            <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                                                                <span>Total Amount</span>
                                                                <span className="text-indigo-600">{formatPrice(order.total)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrders;
