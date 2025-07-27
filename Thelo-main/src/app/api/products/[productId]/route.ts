/*
* =================================================================================================
* FILE: src/app/api/products/[productId]/route.ts
*
* ACTION: Replace the code in this file.
* This version also adds the increased body size limit for editing products.
* =================================================================================================
*/
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import Product from '@/models/Product';
import SellerProfile from '@/models/SellerProfile';

// --- THIS IS THE FIX ---
// Increase the body parser size limit for this specific API route.
// 5mb is a good limit for image uploads.
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '5mb',
        },
    },
};
// -----------------------

interface DecodedToken { id: string; role: string; }

async function getSellerAndVerify(token: string | undefined, productId: string) {
    if (!token) throw new Error('Authentication required.');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    if (decoded.role !== 'seller') throw new Error('Forbidden: Access denied.');
    const sellerProfile = await SellerProfile.findOne({ user: decoded.id });
    if (!sellerProfile) throw new Error('Seller profile not found.');
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found.');
    if (product.seller.toString() !== sellerProfile._id.toString()) { throw new Error('Forbidden: You do not own this product.'); }
    return { product, sellerProfile };
}

export async function PUT(request: NextRequest, { params }: { params: { productId: string } }) {
    await dbConnect();
    try {
        const token = (await cookies()).get('token')?.value;
        const { productId } = params;
        await getSellerAndVerify(token, productId);
        const body = await request.json();
        const updatedProduct = await Product.findByIdAndUpdate(productId, body, { new: true, runValidators: true });
        return NextResponse.json({ message: 'Product updated successfully!', product: updatedProduct }, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: error.message.includes('Forbidden') ? 403 : 500 });
        } else {
            return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
        }
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { productId: string } }) {
    await dbConnect();
    try {
        const token = (await cookies()).get('token')?.value;
        const { productId } = params;
        await getSellerAndVerify(token, productId);
        await Product.findByIdAndDelete(productId);
        return NextResponse.json({ message: 'Product deleted successfully!' }, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: error.message.includes('Forbidden') ? 403 : 500 });
        } else {
            return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
        }
    }
}
