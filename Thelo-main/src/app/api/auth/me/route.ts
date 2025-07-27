import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

interface DecodedToken {
    id: string;
}

export async function GET() {
    await dbConnect();
    try {
        const token = (await cookies()).get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        
        // Find user by ID from token, but don't return the password
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, user });

    } catch (error) {
        console.error("GET_ME_ERROR", error);
        return NextResponse.json({ message: 'Session invalid or expired' }, { status: 401 });
    }
}