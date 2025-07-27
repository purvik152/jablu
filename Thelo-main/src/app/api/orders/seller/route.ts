import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order, { IOrder } from '@/models/Order'; // Import IOrder
import Product from '@/models/Product';
import User from '@/models/User';
import SellerProfile from '@/models/SellerProfile';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';

interface DecodedToken {
    id: string;
    role: string;
}

// --- THIS IS THE FIX ---
// Define the type for an item within an order after it has been populated
interface PopulatedOrderItem {
    product: {
        _id: mongoose.Types.ObjectId;
        name: string;
        imageUrl?: string;
    };
    quantity: number;
    price: number;
    _id: mongoose.Types.ObjectId;
}

export async function GET() {
    await dbConnect();
    try {
        const token = (await cookies()).get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        if (decoded.role !== 'seller') {
            return NextResponse.json({ message: 'Forbidden: Access denied' }, { status: 403 });
        }

        const sellerProfile = await SellerProfile.findOne({ user: decoded.id });
        if (!sellerProfile) {
            return NextResponse.json({ message: 'Seller profile not found' }, { status: 404 });
        }

        const sellerProducts = await Product.find({ seller: sellerProfile._id }).select('_id');
        const sellerProductIds = sellerProducts.map(p => p._id);

        const orders = await Order.find({ 'items.product': { $in: sellerProductIds } })
            .populate({
                path: 'customer',
                model: User,
                select: 'firstName lastName'
            })
            .populate({
                path: 'items.product',
                model: Product,
                select: 'name imageUrl'
            })
            .sort({ createdAt: -1 });

        // Filter items to only show those belonging to the seller
        const sellerOrders = orders.map(order => {
            // Explicitly cast the order items to our defined type
            const sellerItems = (order.items as unknown as PopulatedOrderItem[]).filter(item => 
                sellerProductIds.some(id => id.equals(item.product._id))
            );
            return {
                ...order.toObject(),
                items: sellerItems,
            };
        });

        return NextResponse.json({ success: true, orders: sellerOrders });

    } catch (error) {
        console.error("GET_SELLER_ORDERS_ERROR", error);
        return NextResponse.json({ message: 'Failed to fetch seller orders' }, { status: 500 });
    }
}