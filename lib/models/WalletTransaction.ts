import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWalletTransaction extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'credit' | 'debit';
    amount: number;
    points?: number;
    description: string;
    createdAt: Date;
}

const walletTransactionSchema = new Schema<IWalletTransaction>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, enum: ['credit', 'debit'], required: true },
        amount: { type: Number, required: true },
        points: { type: Number },
        description: { type: String, required: true },
    },
    { timestamps: true }
);

walletTransactionSchema.index({ userId: 1, createdAt: -1 });

const WalletTransaction: Model<IWalletTransaction> =
    mongoose.models.WalletTransaction ||
    mongoose.model<IWalletTransaction>('WalletTransaction', walletTransactionSchema);

export default WalletTransaction;
