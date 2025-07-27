import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/Notification';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET() {
    await dbConnect();
    try {
        const token = (await cookies()).get('token')?.value;
        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

        const notifications = await Notification.find({ user: decoded.id })
            .sort({ createdAt: -1 })
            .limit(10); // Get the 10 most recent notifications
        
        return NextResponse.json({ success: true, notifications });
    } catch {
        return NextResponse.json({ message: 'Error fetching notifications' }, { status: 500 });
    }
}