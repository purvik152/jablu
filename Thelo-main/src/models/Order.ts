import mongoose, { Schema, Document } from 'mongoose';

// Defines the structure of a single item within an order
const OrderItemSchema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true } // Price of the product at the time of purchase
});

// This exports the TypeScript interface for an Order document
export interface IOrder extends Document {
    _id: string;
    customer: Schema.Types.ObjectId; // Link to the User who placed the order
    items: Array<{ 
        product: Schema.Types.ObjectId; 
        quantity: number; 
        price: number 
    }>;
    totalAmount: number;
    shippingAddress: string;
    mobileNumber: string;
    status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
    paymentMethod: 'Cash on Delivery';
    createdAt: Date; // Automatically added by timestamps
}

// This defines the Mongoose schema for an Order
const OrderSchema: Schema = new Schema({
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    shippingAddress: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    paymentMethod: {
        type: String,
        default: 'Cash on Delivery'
    }
}, { 
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// This exports the Mongoose model for use in your API routes
export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
