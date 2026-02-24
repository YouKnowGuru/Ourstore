import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
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
    customizationOptions?: {
        allowTextInput: boolean;
        allowImageUpload: boolean;
        textFields: string[];
        imageFields: string[];
        availableSizes: string[];
        availableColors: string[];
    };
    isFeatured: boolean;
    ratings: {
        average: number;
        count: number;
    };
    tags: string[];
    status: 'active' | 'inactive';
    salesCount: number;
    metaTitle?: string;
    metaDescription?: string;
    createdAt: Date;
    updatedAt: Date;
}

const customizationOptionsSchema = new Schema({
    allowTextInput: { type: Boolean, default: false },
    allowImageUpload: { type: Boolean, default: false },
    textFields: [{ type: String }],
    imageFields: [{ type: String }],
    availableSizes: [{ type: String }],
    availableColors: [{ type: String }],
});

const productSchema = new Schema<IProduct>(
    {
        title: { type: String, required: true, index: true },
        description: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        discountPrice: { type: Number, min: 0 },
        category: { type: String, required: true, index: true },
        subcategory: { type: String },
        images: [{ type: String }],
        stock: { type: Number, default: 0, min: 0 },
        sku: { type: String, unique: true, sparse: true },
        isCustomizable: { type: Boolean, default: false },
        customizationOptions: customizationOptionsSchema,
        isFeatured: { type: Boolean, default: false },
        ratings: {
            average: { type: Number, default: 0, min: 0, max: 5 },
            count: { type: Number, default: 0 },
        },
        tags: [{ type: String, index: true }],
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
        salesCount: { type: Number, default: 0 },
        metaTitle: { type: String },
        metaDescription: { type: String },
    },
    { timestamps: true }
);

productSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);

export default Product;
