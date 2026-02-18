export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  addresses: Address[];
  role: 'user' | 'admin';
  isVerified: boolean;
  wishlist: string[];
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface Address {
  _id: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  dzongkhag: string;
  postalCode: string;
  isDefault: boolean;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  subcategory?: string;
  images: string[];
  stock: number;
  sku?: string;
  isCustomizable: boolean;
  customizationOptions?: CustomizationOptions;
  isFeatured: boolean;
  ratings: {
    average: number;
    count: number;
  };
  tags: string[];
  status: 'active' | 'inactive';
  salesCount: number;
  createdAt: string;
}

export interface CustomizationOptions {
  allowTextInput: boolean;
  allowImageUpload: boolean;
  textFields: string[];
  imageFields: string[];
  availableSizes: string[];
  availableColors: string[];
}

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  customization?: {
    text?: Record<string, string>;
    images?: string[];
    size?: string;
    color?: string;
  };
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId?: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  guestInfo?: {
    fullName: string;
    email: string;
    phone: string;
  };
  isGuest: boolean;
  paymentMethod: 'COD' | 'Online';
  paymentStatus: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  notes?: string;
  trackingNumber?: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  customization?: {
    text?: Record<string, string>;
    images?: string[];
    size?: string;
    color?: string;
  };
  image?: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  dzongkhag: string;
  postalCode: string;
  isDefault: boolean;
}

export interface Review {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    profilePicture?: string;
  };
  productId: string;
  orderId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  category?: string;
  tags: string[];
  author: {
    _id: string;
    fullName: string;
  };
  status: 'draft' | 'published';
  views: number;
  createdAt: string;
}

export interface Gallery {
  _id: string;
  title?: string;
  images: {
    _id: string;
    url: string;
    caption?: string;
  }[];
  album?: string;
  isActive: boolean;
}

export interface Message {
  _id: string;
  userId?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  reply?: string;
  repliedAt?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

export interface FilterState {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  isCustomizable?: boolean;
}
