import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBanner extends Document {
    title: string;
    subtitle?: string;
    buttonText: string;
    image: string;
    linkUrl: string;
    position: string; // e.g., 'home-main', 'home-side'
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
    {
        title: { type: String, required: true },
        subtitle: { type: String },
        buttonText: { type: String, default: 'Shop Now' },
        image: { type: String, required: true },
        linkUrl: { type: String, required: true },
        position: { type: String, default: 'home-main', index: true },
        order: { type: Number, default: 0, index: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Banner: Model<IBanner> = mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema);

export default Banner;
