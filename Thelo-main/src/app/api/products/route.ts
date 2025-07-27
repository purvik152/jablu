/*
* =================================================================================================
* FILE: src/app/api/products/route.ts
*
* ACTION: Replace the code in this file.
* This version adds search and location filtering to your GET function, making
* the search bar on your dashboard fully functional.
* =================================================================================================
*/
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import Product from '@/models/Product';
import SellerProfile from '@/models/SellerProfile';

export const config = { api: { bodyParser: { sizeLimit: '5mb' } } };
interface DecodedToken { id: string; role: string; }

// Your POST function for creating products remains unchanged
export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) { return NextResponse.json({ message: 'Authentication required.' }, { status: 401 }); }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    if (decoded.role !== 'seller') { return NextResponse.json({ message: 'Forbidden: Only sellers can add products.' }, { status: 403 }); }
    const sellerProfile = await SellerProfile.findOne({ user: decoded.id });
    if (!sellerProfile) { return NextResponse.json({ message: 'Seller profile not found.' }, { status: 404 }); }
    const body = await request.json();
    const { name, description, price, category, stock, location, imageUrl } = body;
    const newProduct = new Product({ seller: sellerProfile._id, name, description, price, category, stock, location, status: 'Active', imageUrl });
    await newProduct.save();
    return NextResponse.json({ message: 'Product added successfully!', product: newProduct }, { status: 201 });
  } catch (error: unknown) {
    console.error('PRODUCT_POST_ERROR', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}


// --- THIS IS THE UPDATED GET FUNCTION ---
export async function GET(request: NextRequest) {
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const location = searchParams.get('location');

        // Build a query object that will be sent to the database
        const query: Record<string, unknown> = { status: 'Active' };

        // If a search term is provided, add it to the query
        if (search) {
            // Use a regex for case-insensitive partial matching on both name and category
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
            ];
        }

        // If a location is provided, add it to the query
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        // Execute the query to find the matching products
        const products = await Product.find(query)
            .populate({ path: 'seller', select: 'brandName', model: SellerProfile })
            .sort({ createdAt: -1 });
            
        return NextResponse.json({ success: true, products }, { status: 200 });
    } catch (error: unknown) {
        console.error('PRODUCT_GET_ERROR', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}