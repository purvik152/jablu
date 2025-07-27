/*
* =================================================================================================
* FILE: src/app/api/auth/login/route.ts
*
* ACTION: Replace the code in this file.
* This is the updated, more robust version of your login API.
* It now includes a specific check to ensure a user has a password before trying to
* compare it, which will prevent this specific crash.
* =================================================================================================
*/
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    if (!process.env.JWT_SECRET) {
        console.error("FATAL_ERROR: JWT_SECRET is not defined in .env.local");
        throw new Error("Server configuration error.");
    }

    const { email, password } = await request.json();

    const user = await User.findOne({ email }).select("+password"); // Explicitly select the password
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials. User not found.' }, { status: 401 });
    }

    // --- NEW, CRITICAL FIX ---
    // Check if the user record has a password. This handles cases where a user
    // might have been created through other means or has a corrupted record.
    if (!user.password) {
        return NextResponse.json({ message: 'Invalid account configuration. No password set.' }, { status: 400 });
    }
    // -------------------------

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: 'Invalid credentials. Incorrect password.' }, { status: 401 });
    }

    const tokenPayload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    const response = NextResponse.json({
      message: 'Login successful!',
      success: true,
      user: {
          id: user._id,
          email: user.email,
          role: user.role
      }
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
      console.error('LOGIN_ERROR', error.message);
      return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
    } else {
      console.error('LOGIN_ERROR', error);
      return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
  }
}
