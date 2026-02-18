import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Package, Truck, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice, formatDate } from '@/utils/helpers';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order;

  useEffect(() => {
    if (!order) {
      navigate('/');
    }
  }, [order, navigate]);

  if (!order) return null;

  return (
    <div className="pt-24 pb-16 min-h-screen bg-bhutan-cream">
      <div className="bhutan-container max-w-2xl">
        <div className="bg-white rounded-2xl shadow-bhutan-lg p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-3xl font-display font-bold mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-muted-foreground mb-6">
            Thank you for shopping with us. Your order has been confirmed.
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="font-medium">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-medium">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-medium text-saffron">{formatPrice(order.total)}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate('/orders')}
            >
              View Orders
            </Button>
            <Button
              className="bg-saffron hover:bg-saffron-600"
              onClick={() => navigate('/products')}
            >
              Continue Shopping
            </Button>
          </div>
        </div>

        {/* What's Next */}
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-saffron/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-saffron" />
            </div>
            <h3 className="font-medium mb-1">Order Processing</h3>
            <p className="text-sm text-muted-foreground">We'll prepare your order</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-saffron/10 flex items-center justify-center">
              <Truck className="w-6 h-6 text-saffron" />
            </div>
            <h3 className="font-medium mb-1">Shipping</h3>
            <p className="text-sm text-muted-foreground">Fast delivery across Bhutan</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-saffron/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-saffron" />
            </div>
            <h3 className="font-medium mb-1">Delivery</h3>
            <p className="text-sm text-muted-foreground">3-5 business days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
