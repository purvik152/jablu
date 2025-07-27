/*
* =================================================================================================
* FILE: src/app/api/products/my-products/route.ts
*
* ACTION: Create this new file and folder.
* This API endpoint is what your seller dashboard is trying to call. Creating this
* file will solve the "Unexpected end of JSON input" error.
* =================================================================================================
*/
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import Product from '@/models/Product';
import SellerProfile from '@/models/SellerProfile';

interface DecodedToken {
  id: string;
  role: string;
}

export async function GET() {
    await dbConnect();

    try {
        const token = (await cookies()).get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        
        if (decoded.role !== 'seller') {
            return NextResponse.json({ message: 'Forbidden: Access denied.' }, { status: 403 });
        }

        const sellerProfile = await SellerProfile.findOne({ user: decoded.id });
        if (!sellerProfile) {
            // If the seller has no profile, it's not an error, they just have no products.
            // Return an empty array.
            return NextResponse.json({ success: true, products: [] }, { status: 200 });
        }

        const products = await Product.find({ seller: sellerProfile._id }).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, products }, { status: 200 });

    } catch (error) {
        console.error('MY_PRODUCTS_GET_ERROR', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
