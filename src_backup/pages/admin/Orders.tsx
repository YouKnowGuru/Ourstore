import { useEffect, useState } from 'react';
import { Eye, Package, Truck, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { orderAPI } from '@/services/api';
import { formatPrice, formatDate, getOrderStatusColor } from '@/utils/helpers';
import { toast } from 'sonner';

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

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
      toast.success('Order status updated');
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
      <h1 className="text-2xl font-display font-bold">Orders</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4">Order ID</th>
              <th className="text-left py-3 px-4">Customer</th>
              <th className="text-left py-3 px-4">Date</th>
              <th className="text-left py-3 px-4">Total</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{order.orderNumber}</td>
                <td className="py-3 px-4">
                  {order.isGuest ? order.guestInfo?.fullName : order.userId?.fullName}
                </td>
                <td className="py-3 px-4">{formatDate(order.createdAt)}</td>
                <td className="py-3 px-4">{formatPrice(order.total)}</td>
                <td className="py-3 px-4">
                  <Badge className={getOrderStatusColor(order.orderStatus)}>
                    {order.orderStatus}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <Eye className="w-4 h-4" />
                    </button>
                    {order.orderStatus === 'Pending' && (
                      <button
                        className="p-2 hover:bg-blue-50 rounded text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => updateStatus(order._id, 'Processing')}
                        disabled={updatingOrderId === order._id}
                        title="Mark as Processing"
                      >
                        {updatingOrderId === order._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Package className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    {order.orderStatus === 'Processing' && (
                      <button
                        className="p-2 hover:bg-purple-50 rounded text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => updateStatus(order._id, 'Shipped')}
                        disabled={updatingOrderId === order._id}
                        title="Mark as Shipped"
                      >
                        {updatingOrderId === order._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Truck className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    {order.orderStatus === 'Shipped' && (
                      <button
                        className="p-2 hover:bg-green-50 rounded text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => updateStatus(order._id, 'Delivered')}
                        disabled={updatingOrderId === order._id}
                        title="Mark as Delivered"
                      >
                        {updatingOrderId === order._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    {order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
                      <button
                        className="p-2 hover:bg-red-50 rounded text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => updateStatus(order._id, 'Cancelled')}
                        disabled={updatingOrderId === order._id}
                        title="Cancel Order"
                      >
                        {updatingOrderId === order._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
