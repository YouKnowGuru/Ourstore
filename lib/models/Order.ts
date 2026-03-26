import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
    productId: mongoose.Types.ObjectId;
    title: string;
    price: number;
    quantity: number;
    customization?: {
        text?: Map<string, string>;
        images?: string[];
        size?: string;
        color?: string;
    };
    image?: string;
}

export interface IShippingAddress {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    dzongkhag: string;
    postalCode: string;
}

export interface IOrder extends Document {
    userId?: mongoose.Types.ObjectId;
    orderNumber: string;
    items: IOrderItem[];
    shippingAddress: IShippingAddress;
    guestInfo?: {
        fullName?: string;
        email?: string;
        phone?: string;
    };
    isGuest: boolean;
    paymentMethod: 'COD' | 'Online';
    paymentStatus: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
    orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    subtotal: number;
    shippingFee: number;
    tax: number;
    walletAmount: number;
    total: number;
    notes?: string;
    trackingNumber?: string;
    bfsTransactionId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const customizationSchema = new Schema({
    text: { type: Map, of: String },
    images: [{ type: String }],
    size: { type: String },
    color: { type: String },
});

const orderItemSchema = new Schema<IOrderItem>({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    customization: customizationSchema,
    image: { type: String },
});

const shippingAddressSchema = new Schema<IShippingAddress>({
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    dzongkhag: { type: String, required: true },
    postalCode: { type: String, required: true },
});

const orderSchema = new Schema<IOrder>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        orderNumber: { type: String, unique: true, required: true },
        items: [orderItemSchema],
        shippingAddress: shippingAddressSchema,
        guestInfo: {
            fullName: { type: String },
            email: { type: String },
            phone: { type: String },
        },
        isGuest: { type: Boolean, default: false },
        paymentMethod: { type: String, enum: ['COD', 'Online'], required: true },
        paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Refunded'], default: 'Pending' },
        orderStatus: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
        subtotal: { type: Number, required: true },
        shippingFee: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        walletAmount: { type: Number, default: 0 },
        total: { type: Number, required: true },
        notes: { type: String },
        trackingNumber: { type: String },
        bfsTransactionId: { type: Schema.Types.ObjectId, ref: 'BfsTransaction' },
    },
    { timestamps: true }
);

orderSchema.index({ orderNumber: 1, userId: 1, orderStatus: 1 });

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);

export default Order;
