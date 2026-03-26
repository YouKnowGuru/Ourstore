import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAppSettings extends Document {
    pointToNuRate: number;
    minRedeemPoints: number;
    maxRedeemPercentage: number;
    signupPoints: number;
    purchasePointRate: number;
    referralRewardPoints: number;
    referredSignupBonus: number;
}

const appSettingsSchema = new Schema<IAppSettings>({
    pointToNuRate: { type: Number, default: 0.1 },         // 1 point = 0.1 Nu.
    minRedeemPoints: { type: Number, default: 100 },        // min 100 points to convert
    maxRedeemPercentage: { type: Number, default: 50 },     // max 50% of cart
    signupPoints: { type: Number, default: 50 },            // points on signup
    purchasePointRate: { type: Number, default: 0.05 },     // 5% of order value as points
    referralRewardPoints: { type: Number, default: 100 },   // reward for the referrer
    referredSignupBonus: { type: Number, default: 50 },    // extra bonus for the referred user
});

// Always use a single settings document (singleton pattern)
const AppSettings: Model<IAppSettings> =
    mongoose.models.AppSettings ||
    mongoose.model<IAppSettings>('AppSettings', appSettingsSchema);

export default AppSettings;

// Helper to get (or create default) settings
export async function getSettings(): Promise<IAppSettings> {
    let settings = await AppSettings.findOne();
    if (!settings) {
        settings = await AppSettings.create({});
    }
    return settings;
}
