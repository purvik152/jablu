import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import Notification from '@/models/Notification';
import Product from '@/models/Product';
import SellerProfile from '@/models/SellerProfile';

interface DecodedToken {
    id: string;
}

export async function POST(request: NextRequest) {
    console.log("ORDER API: Received a request.");
    try {
        await dbConnect();
        console.log("ORDER API: Database connection successful.");

        const token = (await cookies()).get('token')?.value;
        if (!token) {
            console.error("ORDER API: Auth failed - No token.");
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }
        console.log("ORDER API: Token found.");

        const decoded = jwt.verify(token, process.env.JWT_SECRET!, { algorithms: ["HS256"] }) as DecodedToken;
        const customerId = decoded.id;
        console.log(`ORDER API: Token decoded for customer ID: ${customerId}`);

        const body = await request.json();
        console.log("ORDER API: Request body parsed.");

        const newOrder = new Order({
            customer: customerId,
            items: body.items,
            totalAmount: body.totalAmount,
            shippingAddress: body.shippingAddress,
            mobileNumber: body.mobileNumber,
        });
        console.log("ORDER API: New order object created.");

        await newOrder.save();
        console.log("ORDER API: Order saved to database successfully!");

        // Safer notification logic
        try {
            console.log("ORDER API: Attempting to create notification for seller.");
            const firstProductId = newOrder.items[0]?.product;
            if (firstProductId) {
                const product = await Product.findById(firstProductId);
                if (product) {
                    const sellerProfile = await SellerProfile.findById(product.seller);
                    if (sellerProfile) {
                        await new Notification({
                            user: sellerProfile.user,
                            message: `You have a new order (#${newOrder._id.toString().slice(-6).toUpperCase()})`,
                            link: '/dashboard/seller/orders'
                        }).save();
                        console.log("ORDER API: Notification for seller created successfully.");
                    } else {
                         console.error("ORDER API: Notification failed - Seller profile not found.");
                    }
                } else {
                    console.error("ORDER API: Notification failed - Product not found.");
                }
            }
        } catch (notificationError: any) {
            console.error("--- ORDER API: FAILED TO CREATE NOTIFICATION ---");
            console.error(notificationError.message);
        }

        return NextResponse.json({ message: 'Order created successfully', order: newOrder }, { status: 201 });

    } catch (error: any) {
        console.error("--- ORDER API CRASH ---");
        console.error(error.message);
        console.error("-----------------------");
        return NextResponse.json({ message: 'Failed to create order on the server.' }, { status: 500 });
    }
}