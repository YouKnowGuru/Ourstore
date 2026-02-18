import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Truck, CheckCircle, ChevronRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { userAPI } from '@/services/api';
import { formatPrice } from '@/utils/helpers';
import { toast } from 'sonner';

const dzongkhags = [
  'Bumthang', 'Chhukha', 'Dagana', 'Gasa', 'Haa', 'Lhuentse',
  'Mongar', 'Paro', 'Pema Gatshel', 'Punakha', 'Samdrup Jongkhar',
  'Samtse', 'Sarpang', 'Thimphu', 'Trashigang', 'Trashiyangtse',
  'Trongsa', 'Tsirang', 'Wangdue Phodrang', 'Zhemgang'
];

const Checkout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { items, total, emptyCart } = useCart();
  const { placeOrder } = useOrders();

  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Online'>('COD');

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    dzongkhag: '',
    postalCode: '',
  });

  const [saveAddress, setSaveAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Auto-fetch default address or select the first one
  useState(() => {
    if (user?.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setShippingAddress({
        fullName: user.fullName || '',
        phone: user.phone || '',
        addressLine1: defaultAddr.addressLine1,
        addressLine2: defaultAddr.addressLine2 || '',
        city: defaultAddr.city,
        dzongkhag: defaultAddr.dzongkhag,
        postalCode: defaultAddr.postalCode,
      });
      setSelectedAddressId(defaultAddr._id);
    }
  });

  const shippingFee = total > 5000 ? 0 : 150;
  const tax = Math.round(total * 0.05 * 100) / 100;
  const grandTotal = total + shippingFee + tax;

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleSelectSavedAddress = (address: any) => {
    setShippingAddress({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      dzongkhag: address.dzongkhag,
      postalCode: address.postalCode,
    });
    setSelectedAddressId(address._id);
    toast.success('Shipping address updated');
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shippingAddress.fullName || !shippingAddress.phone ||
      !shippingAddress.addressLine1 || !shippingAddress.city ||
      !shippingAddress.dzongkhag || !shippingAddress.postalCode) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Save address to profile if requested and it's a new address
    if (saveAddress && isAuthenticated && !selectedAddressId) {
      try {
        await userAPI.addAddress(shippingAddress);
        toast.success('Address saved to your profile');
      } catch (err) {
        console.error('Failed to save address:', err);
      }
    }

    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    try {
      const orderItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        customization: item.customization,
      }));

      const result = await placeOrder({
        items: orderItems,
        shippingAddress,
        paymentMethod,
        isGuest: !user,
      }).unwrap();

      emptyCart();
      toast.success('Order placed successfully!');
      navigate('/order-success', { state: { order: result.order } });
    } catch (error: any) {
      toast.error(error || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="pt-24 pb-16 bg-gray-50/30">
      <div className="bhutan-container">
        <h1 className="text-4xl font-display font-black tracking-tight mb-10 bg-gradient-to-r from-maroon to-saffron bg-clip-text text-transparent">Checkout</h1>

        {/* Progress System */}
        <div className="flex items-center gap-6 mb-12 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${step >= 1 ? 'bg-saffron text-white shadow-glow-saffron rotate-6' : 'bg-white border text-gray-400'}`}>
              <MapPin className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-black uppercase tracking-widest ${step >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>Shipping</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Delivery details</span>
            </div>
          </div>
          <div className="flex-1 h-px bg-gray-200 relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-r from-saffron to-maroon transition-all duration-700 ${step >= 2 ? 'translate-x-0' : '-translate-x-full'}`} />
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${step >= 2 ? 'bg-saffron text-white shadow-glow-saffron rotate-6' : 'bg-white border text-gray-400'}`}>
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-black uppercase tracking-widest ${step >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>Payment</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Transaction</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 ? (
              <div className="space-y-8 animate-fade-in">
                {/* Saved Addresses Selector */}
                {isAuthenticated && user?.addresses && user.addresses.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-display font-bold flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-saffron rounded-full" />
                      Saved Delivery Addresses
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {user.addresses.map((addr) => (
                        <button
                          key={addr._id}
                          type="button"
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={`group relative p-5 rounded-3xl border-2 text-left transition-all duration-500 backdrop-blur-md overflow-hidden ${selectedAddressId === addr._id
                            ? 'border-saffron bg-saffron/5 shadow-glow-saffron sm:scale-[1.02]'
                            : 'border-white bg-white/60 hover:border-gray-200'
                            }`}
                        >
                          {/* Accent Background Glow */}
                          <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl transition-opacity duration-500 ${selectedAddressId === addr._id ? 'bg-saffron/20 opacity-100' : 'bg-saffron/5 opacity-0 group-hover:opacity-100'}`} />

                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${addr.isDefault ? 'bg-maroon text-white' : 'bg-gray-100 text-gray-400'}`}>
                                {addr.isDefault ? 'Default' : 'Saved'}
                              </span>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedAddressId === addr._id ? 'border-saffron bg-saffron' : 'border-gray-200'}`}>
                                {selectedAddressId === addr._id && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
                              </div>
                            </div>
                            <p className="font-black text-gray-900 line-clamp-1">{addr.addressLine1}</p>
                            <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-tight">{addr.city}, {addr.dzongkhag}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleAddressSubmit} className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-8 md:p-10 space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-display font-black">Shipping Details</h2>
                    <div className="w-12 h-1 bg-gradient-to-r from-saffron to-maroon rounded-full" />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-xs font-black uppercase tracking-widest text-gray-400 px-1">Receiver Name *</Label>
                      <Input
                        id="fullName"
                        value={shippingAddress.fullName}
                        onChange={(e) => {
                          setShippingAddress({ ...shippingAddress, fullName: e.target.value });
                          setSelectedAddressId(null);
                        }}
                        className="h-12 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-saffron/10 focus:border-saffron/50 transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-gray-400 px-1">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={shippingAddress.phone}
                        onChange={(e) => {
                          setShippingAddress({ ...shippingAddress, phone: e.target.value });
                          setSelectedAddressId(null);
                        }}
                        className="h-12 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-saffron/10 focus:border-saffron/50 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="addressLine1" className="text-xs font-black uppercase tracking-widest text-gray-400 px-1">Street / Building *</Label>
                      <Input
                        id="addressLine1"
                        value={shippingAddress.addressLine1}
                        onChange={(e) => {
                          setShippingAddress({ ...shippingAddress, addressLine1: e.target.value });
                          setSelectedAddressId(null);
                        }}
                        className="h-12 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-saffron/10 focus:border-saffron/50 transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressLine2" className="text-xs font-black uppercase tracking-widest text-gray-400 px-1">Locality / Landmark</Label>
                      <Input
                        id="addressLine2"
                        value={shippingAddress.addressLine2}
                        onChange={(e) => {
                          setShippingAddress({ ...shippingAddress, addressLine2: e.target.value });
                          setSelectedAddressId(null);
                        }}
                        className="h-12 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-saffron/10 focus:border-saffron/50 transition-all font-medium"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-xs font-black uppercase tracking-widest text-gray-400 px-1">City *</Label>
                        <Input
                          id="city"
                          value={shippingAddress.city}
                          onChange={(e) => {
                            setShippingAddress({ ...shippingAddress, city: e.target.value });
                            setSelectedAddressId(null);
                          }}
                          className="h-12 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-saffron/10 focus:border-saffron/50 transition-all"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dzongkhag" className="text-xs font-black uppercase tracking-widest text-gray-400 px-1">Dzongkhag *</Label>
                        <select
                          id="dzongkhag"
                          value={shippingAddress.dzongkhag}
                          onChange={(e) => {
                            setShippingAddress({ ...shippingAddress, dzongkhag: e.target.value });
                            setSelectedAddressId(null);
                          }}
                          className="w-full h-12 px-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-saffron/10 focus:border-saffron/50 transition-all outline-none font-medium"
                          required
                        >
                          <option value="">Select Dzongkhag</option>
                          {dzongkhags.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postalCode" className="text-xs font-black uppercase tracking-widest text-gray-400 px-1">Postal Code *</Label>
                      <Input
                        id="postalCode"
                        value={shippingAddress.postalCode}
                        onChange={(e) => {
                          setShippingAddress({ ...shippingAddress, postalCode: e.target.value });
                          setSelectedAddressId(null);
                        }}
                        className="h-12 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-saffron/10 focus:border-saffron/50 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Save to Profile Option */}
                  {isAuthenticated && !selectedAddressId && (
                    <div
                      className="flex items-center gap-3 p-4 bg-saffron/5 rounded-2xl border border-saffron/10 cursor-pointer group hover:bg-saffron/10 transition-colors"
                      onClick={() => setSaveAddress(!saveAddress)}
                    >
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${saveAddress ? 'bg-saffron border-saffron shadow-glow-saffron' : 'border-saffron/30 bg-white'}`}>
                        {saveAddress && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900">Save delivery address</span>
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Add to your profile for future orders</span>
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full h-14 bg-gradient-to-r from-maroon to-maroon-800 hover:scale-[1.02] text-white rounded-2xl font-black shadow-xl transition-all duration-500">
                    Next: Payment Options
                  </Button>
                </form>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-8 md:p-10 space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-display font-black">Payment Method</h2>
                    <div className="w-12 h-1 bg-gradient-to-r from-saffron to-maroon rounded-full" />
                  </div>

                  <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'COD' | 'Online')}>
                    <div className="grid gap-4">
                      {[
                        { id: 'COD', title: 'Cash on Delivery', desc: 'Securely pay upon delivery', icon: Truck, color: 'emerald' },
                        { id: 'Online', title: 'Online Payment', desc: 'Pay instantly via Banking/QR', icon: CreditCard, color: 'blue' }
                      ].map((item) => (
                        <label
                          key={item.id}
                          className={`group relative flex items-center gap-5 p-6 rounded-3xl border-2 cursor-pointer transition-all duration-500 ${paymentMethod === item.id
                            ? `border-${item.color === 'emerald' ? 'green' : 'blue'}-500 bg-${item.color === 'emerald' ? 'green' : 'blue'}-50 shadow-xl`
                            : 'border-gray-50 bg-gray-50/30 hover:bg-white hover:border-gray-200'
                            }`}
                        >
                          <RadioGroupItem value={item.id} className="sr-only" />
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${paymentMethod === item.id ? `bg-${item.color === 'emerald' ? 'green' : 'blue'}-500 text-white rotate-6` : 'bg-white text-gray-400 group-hover:rotate-3'}`}>
                            <item.icon className="w-7 h-7" />
                          </div>
                          <div className="flex-1">
                            <p className="font-black text-gray-900">{item.title}</p>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">{item.desc}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === item.id ? `border-${item.color === 'emerald' ? 'green' : 'blue'}-500 bg-${item.color === 'emerald' ? 'green' : 'blue'}-500` : 'border-gray-200'}`}>
                            {paymentMethod === item.id && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>

                  <div className="flex gap-4 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="h-14 px-8 rounded-2xl border-gray-200 font-bold hover:bg-gray-50"
                    >
                      Back to Shipping
                    </Button>
                    <Button
                      className="flex-1 h-14 bg-gradient-to-r from-saffron to-saffron-600 hover:scale-[1.02] text-white rounded-2xl font-black shadow-xl transition-all duration-500"
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Securing Transaction...' : 'Place My Order Now'}
                    </Button>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <p className="text-sm text-amber-800 font-medium leading-relaxed">
                    By placing this order, you agree to our <span className="underline font-black cursor-pointer">Terms of Service</span>. Your transaction is secured with 256-bit encryption.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary - Premium Glass */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-xl font-display font-black flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-maroon" />
                  Order Summary
                </h2>
                <span className="bg-maroon/5 text-maroon text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{items.length} Items</span>
              </div>

              <div className="p-8 space-y-6 max-h-[50vh] overflow-y-auto custom-scrollbar">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4 group">
                    <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <img src={item.image} alt={item.title} className="w-12 h-12 object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{item.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-400 font-bold">QTY: {item.quantity}</span>
                        <span className="text-sm font-black text-maroon">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-8 bg-gray-50/50 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-bold uppercase tracking-tight text-xs">Subtotal</span>
                    <span className="font-bold text-gray-900">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-bold uppercase tracking-tight text-xs">Delivery Fee</span>
                    <span className={`font-bold ${shippingFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {shippingFee === 0 ? 'COMPLIMENTARY' : formatPrice(shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-bold uppercase tracking-tight text-xs">Tax (Incl.)</span>
                    <span className="font-bold text-gray-900">{formatPrice(tax)}</span>
                  </div>
                </div>

                <Separator className="bg-gray-200 h-px" />

                <div className="flex justify-between items-center pt-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Grand Total</span>
                    <span className="text-3xl font-display font-black text-maroon">{formatPrice(grandTotal)}</span>
                  </div>
                  <ChevronRight className="w-8 h-8 text-gray-200 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
