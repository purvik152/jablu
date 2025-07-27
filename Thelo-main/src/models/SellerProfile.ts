import mongoose, { Schema, Document } from 'mongoose';

export interface ISellerProfile extends Document {
  user: Schema.Types.ObjectId;
  brandName: string;
  businessAddress: string;
  gstNumber?: string;
}

const SellerProfileSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  brandName: { type: String, required: true, trim: true },
  businessAddress: { type: String, required: true },
  gstNumber: { type: String },
}, { timestamps: true });

export default mongoose.models.SellerProfile || mongoose.model<ISellerProfile>('SellerProfile', SellerProfileSchema);