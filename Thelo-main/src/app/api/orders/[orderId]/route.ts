import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import Notification from '@/models/Notification';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

interface DecodedToken {
  id: string;
  role: string;
}

export async function PUT(request: NextRequest) {
  await dbConnect();

  try {
    // ✅ Extract orderId from the URL
    const pathnameParts = request.nextUrl.pathname.split('/');
    const orderId = pathnameParts[pathnameParts.length - 1];

    const { status } = await request.json();

    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!, { algorithms: ['HS256'] }) as DecodedToken;

    if (decoded.role !== 'seller') {
      return NextResponse.json({ message: 'Forbidden: Access denied' }, { status: 403 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    // Optional: verify the seller owns this order (recommended in production)

    order.status = status;
    await order.save();
    console.log(`✅ UPDATE_ORDER_API: Order ${orderId} status updated to ${status}.`);

    // Create customer notification
    try {
      await new Notification({
        user: order.customer,
        message: `Your order (#${order._id.toString().slice(-6).toUpperCase()}) has been ${status}.`,
        link: '/dashboard/shopkeeper/orders',
      }).save();
      console.log('✅ Notification created');
    } catch (notificationError: unknown) {
      console.error('--- UPDATE_ORDER_API: NOTIFICATION CREATION FAILED ---');
      if (notificationError instanceof Error) {
          console.error(notificationError.message);
      } else {
          console.error(notificationError);
      }
      console.error('--------------------------------------------------');
    }

    return NextResponse.json({ success: true, order });

  } catch (error: unknown) {
    console.error('--- UPDATE_ORDER_API CRASH ---');
    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error(error);
    }
    return NextResponse.json({ message: 'Failed to update order status' }, { status: 500 });
  }
}
