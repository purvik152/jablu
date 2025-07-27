/*
* =================================================================================================
* FILE: src/app/api/auth/login/route.ts
*
* ACTION: Final, improved version of login API with:
* - Password existence check
* - JWT signing and secure cookie
* - Type safety and error handling
* =================================================================================================
*/

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('FATAL_ERROR: JWT_SECRET is not defined in .env.local');
      throw new Error('Server configuration error. JWT secret is missing.');
    }

    const { email, password }: { email: string; password: string } = await request.json();

    const user = await User.findOne({ email }).select('+password'); // Ensure password is retrieved

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials. User not found.' }, { status: 401 });
    }

    // --- CRITICAL FIX ---
    if (!user.password) {
      return NextResponse.json({ message: 'Invalid account configuration. No password set.' }, { status: 400 });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: 'Invalid credentials. Incorrect password.' }, { status: 401 });
    }

    const tokenPayload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, secret, {
      expiresIn: '1d',
    });

    const response = NextResponse.json({
      message: 'Login successful!',
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 1, // 1 day
      path: '/',
    });

    return response;

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('LOGIN_ERROR:', error.message);
      return NextResponse.json({ message: error.message || 'Internal server error.' }, { status: 500 });
    } else {
      console.error('LOGIN_ERROR:', error);
      return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
    }
  }
}
