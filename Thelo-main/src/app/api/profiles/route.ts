/*
* =================================================================================================
* FILE: src/app/api/profiles/route.ts
*
* ACTION: Please verify that this file exists at this exact path.
* The 404 error means the server cannot find this file, likely due to a typo
* in the 'profiles' folder name.
* =================================================================================================
*/
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Import your new models
import SellerProfile from '@/models/SellerProfile';
import ShopkeeperProfile from '@/models/ShopkeeperProfile';
import User from '@/models/User'; // We need the User model too

// Helper interface for our decoded token
interface DecodedToken {
  id: string;
  role: string;
}

// --- GET: To fetch a user's profile ---
export async function GET() {
    await dbConnect();
    try {
        const token = (await cookies()).get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Authentication failed: No token provided.' }, { status: 401 });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        if (!decoded) {
            return NextResponse.json({ message: 'Authentication failed: Invalid token.' }, { status: 401 });
        }
        const { id: userId, role } = decoded;
        let profile = null;
        if (role === 'seller') {
            profile = await SellerProfile.findOne({ user: userId }).populate('user', 'firstName lastName email');
        } else if (role === 'shopkeeper') {
            profile = await ShopkeeperProfile.findOne({ user: userId }).populate('user', 'firstName lastName email');
        } else {
            return NextResponse.json({ message: 'Invalid user role.' }, { status: 400 });
        }
        if (!profile) {
            return NextResponse.json({ message: 'Profile not found. Please create one.' }, { status: 404 });
        }
        return NextResponse.json({ success: true, profile }, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error && (error as any).name === 'JsonWebTokenError') {
            return NextResponse.json({ message: 'Authentication failed: Invalid token.' }, { status: 401 });
        }
        console.error('PROFILE_FETCH_ERROR', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}


// --- POST: To create a user's profile ---
export async function POST() {
  await dbConnect();
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Authentication failed: No token provided.' }, { status: 401 });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    if (!decoded) {
      return NextResponse.json({ message: 'Authentication failed: Invalid token.' }, { status: 401 });
    }
    const { id: userId, role } = decoded;
    const body = await request.json();
    const user = await User.findById(userId);
    if (!user) {
        return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }
    if (role === 'seller') {
      const { brandName, businessAddress, gstNumber } = body;
      const existingProfile = await SellerProfile.findOne({ user: userId });
      if (existingProfile) {
          return NextResponse.json({ message: 'Profile already exists.' }, { status: 409 });
      }
      const newSellerProfile = new SellerProfile({ user: userId, brandName, businessAddress, gstNumber });
      await newSellerProfile.save();
      return NextResponse.json({ message: 'Seller profile created successfully!', profile: newSellerProfile }, { status: 201 });
    } else if (role === 'shopkeeper') {
      const { shopName, shopAddress, contactNumber } = body;
      const existingProfile = await ShopkeeperProfile.findOne({ user: userId });
      if (existingProfile) {
          return NextResponse.json({ message: 'Profile already exists.' }, { status: 409 });
      }
      const newShopkeeperProfile = new ShopkeeperProfile({ user: userId, shopName, shopAddress, contactNumber });
      await newShopkeeperProfile.save();
      return NextResponse.json({ message: 'Shopkeeper profile created successfully!', profile: newShopkeeperProfile }, { status: 201 });
    } else {
      return NextResponse.json({ message: 'Invalid user role.' }, { status: 400 });
    }
  } catch (error: unknown) {
    if (error instanceof Error && (error as any).name === 'JsonWebTokenError') {
        return NextResponse.json({ message: 'Authentication failed: Invalid token.' }, { status: 401 });
    }
    console.error('PROFILE_CREATION_ERROR', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
