import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import Product from '@/models/Product';

interface DecodedToken {
    id: string;
}

export async function GET() {
    console.log("MY_ORDERS_API: Received a request.");
    try {
        await dbConnect();
        console.log("MY_ORDERS_API: Database connection successful.");

        const token = (await cookies()).get('token')?.value;
        if (!token) {
            console.error("MY_ORDERS_API: Auth failed - No token.");
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }
        console.log("MY_ORDERS_API: Token found.");

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        const customerId = decoded.id;
        console.log(`MY_ORDERS_API: Token decoded for customer ID: ${customerId}`);

        console.log(`MY_ORDERS_API: Attempting to find orders for customer: ${customerId}`);
        const orders = await Order.find({ customer: customerId })
            .populate({
                path: 'items.product',
                model: Product,
                select: 'name imageUrl'
            })
            .sort({ createdAt: -1 });
        
        console.log(`MY_ORDERS_API: Found ${orders.length} orders in the database.`);

        return NextResponse.json({ success: true, orders });

    } catch (error: unknown) {
        console.error("--- MY_ORDERS_API CRASH ---");
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error(error);
        }
        console.error("---------------------------");
        return NextResponse.json({ message: 'Failed to fetch orders on the server.' }, { status: 500 });
    }
}