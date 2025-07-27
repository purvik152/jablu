import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const { firstName, lastName, email, password, role } = await request.json();

    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    return NextResponse.json({
      message: 'User created successfully!',
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('SIGNUP_ERROR', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}