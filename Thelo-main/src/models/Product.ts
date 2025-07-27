/*
* =================================================================================================
* FILE: src/models/Product.ts
*
* This model defines the structure for every product in your marketplace.
* It links each product to a SellerProfile.
* =================================================================================================
*/
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  seller: Schema.Types.ObjectId; // Reference to the SellerProfile
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  location: string; // Seller's location for this product
  status: 'Active' | 'Archived';
  imageUrl?: string;
}

const ProductSchema: Schema = new Schema({
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'SellerProfile', // This creates the link to the SellerProfile model
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide a product name.'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description.'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price.'],
  },
  category: {
    type: String,
    required: [true, 'Please provide a category.'],
  },
  stock: {
    type: Number,
    required: [true, 'Please provide stock quantity.'],
  },
  location: {
    type: String,
    required: [true, 'Please provide a location.'],
  },
  status: {
    type: String,
    enum: ['Active', 'Archived'],
    default: 'Active',
  },
  imageUrl: {
    type: String,
  },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);