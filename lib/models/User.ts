import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAddress {
    _id?: mongoose.Types.ObjectId;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    dzongkhag: string;
    postalCode: string;
    isDefault: boolean;
}

export interface IPointHistory {
    type: 'earn' | 'redeem';
    points: number;
    amount?: number;
    reason: string;
    createdAt: Date;
}

export interface IUser extends Document {
    fullName: string;
    email: string;
    password?: string;
    phone?: string;
    profilePicture: string;
    addresses: IAddress[];
    role: 'user' | 'admin';
    isVerified: boolean;
    googleId?: string;
    wishlist: mongoose.Types.ObjectId[];
    otp?: string;
    otpExpiry?: Date;
    refreshTokens: string[];
    isActive: boolean;
    points: number;
    walletBalance: number;
    pointHistory: IPointHistory[];
    createdAt: Date;
    updatedAt: Date;
    referralCode: string;
    referredBy?: mongoose.Types.ObjectId;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const addressSchema = new Schema<IAddress>({
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    dzongkhag: { type: String, required: true },
    postalCode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
});

const pointHistorySchema = new Schema<IPointHistory>({
    type: { type: String, enum: ['earn', 'redeem'], required: true },
    points: { type: Number, required: true },
    amount: { type: Number },
    reason: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
}, { _id: false });

const userSchema = new Schema<IUser>(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String },
        phone: { type: String },
        profilePicture: { type: String, default: '' },
        addresses: [addressSchema],
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        isVerified: { type: Boolean, default: false },
        googleId: { type: String },
        wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
        otp: { type: String },
        otpExpiry: { type: Date },
        refreshTokens: [{ type: String }],
        isActive: { type: Boolean, default: true },
        points: { type: Number, default: 0 },
        walletBalance: { type: Number, default: 0 },
        pointHistory: [pointHistorySchema],
        referralCode: { type: String, unique: true, sparse: true },
        referredBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    // Generate referral code if missing
    if (!this.referralCode) {
        this.referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    if (!this.isModified('password') || !this.password) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
