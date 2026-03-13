import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBfsTransaction extends Document {
  orderId: mongoose.Types.ObjectId;
  orderNo: string;
  bfsTxnId: string;
  amount: number;
  currency: string;
  remitterName: string;
  remitterEmail: string;
  remitterBankId: string;
  debitAuthCode: string;
  debitAuthNo: string;
  status: 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'TIMEOUT';
  statusMessage: string;
  arPayload: Record<string, unknown>;
  acPayload: Record<string, unknown>;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const bfsTransactionSchema = new Schema<IBfsTransaction>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    orderNo: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    bfsTxnId: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'BTN',
    },
    remitterName: {
      type: String,
      default: '',
    },
    remitterEmail: {
      type: String,
      default: '',
    },
    remitterBankId: {
      type: String,
      default: '',
    },
    debitAuthCode: {
      type: String,
      default: '',
    },
    debitAuthNo: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['INITIATED', 'PENDING', 'SUCCESS', 'FAILED', 'TIMEOUT'],
      default: 'INITIATED',
    },
    statusMessage: {
      type: String,
      default: '',
    },
    arPayload: {
      type: Schema.Types.Mixed,
      default: {},
    },
    acPayload: {
      type: Schema.Types.Mixed,
      default: {},
    },
    retryCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const BfsTransaction: Model<IBfsTransaction> =
  mongoose.models.BfsTransaction ||
  mongoose.model<IBfsTransaction>('BfsTransaction', bfsTransactionSchema);

export default BfsTransaction;
