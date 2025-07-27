/*
* =================================================================================================
* FILE: src/models/ShopkeeperProfile.ts
*
* ACTION: Create this file inside your 'src/models' folder.
* This model stores extra information ONLY for users with the 'shopkeeper' role.
* Creating this file will fix the final import error in your API.
* =================================================================================================
*/
import mongoose, { Schema, Document } from 'mongoose';

export interface IShopkeeperProfile extends Document {
  user: Schema.Types.ObjectId; // Reference to the main User document
  shopName: string;
  shopAddress: string;
  contactNumber: string;
}

const ShopkeeperProfileSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // This creates the link to the User model
    required: true,
    unique: true, // Ensures one shopkeeper profile per user
  },
  shopName: {
    type: String,
    required: [true, 'Please provide your shop name.'],
    trim: true,
  },
  shopAddress: {
    type: String,
    required: [true, 'Please provide your shop address.'],
  },
  contactNumber: {
    type: String,
    required: [true, 'Please provide a contact number.'],
  },
}, { timestamps: true });

export default mongoose.models.ShopkeeperProfile || mongoose.model<IShopkeeperProfile>('ShopkeeperProfile', ShopkeeperProfileSchema);
