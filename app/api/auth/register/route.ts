import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { hashPassword, isValidEmail } from '@/lib/utils/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, full_name, phone } = await request.json();

    // Validation
    if (!username || !email || !password || !full_name) {
      return NextResponse.json(
        { error: 'Username, email, password, and full name are required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Hash password with MD5
    const hashedPassword = hashPassword(password);

    // Check if username already exists
    const { data: existingUsername } = await supabaseServer
      .from('app_users')
      .select('id, username')
      .eq('username', username)
      .single();

    if (existingUsername) {
      console.log('Username already exists in app_users:', username);
      return NextResponse.json(
        { 
          success: false,
          error: 'Username already taken'
        },
        { status: 409 }
      );
    }

    // Check if email already exists
    const { data: existingEmail } = await supabaseServer
      .from('app_users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (existingEmail) {
      console.log('Email already exists in app_users:', email);
      return NextResponse.json(
        { 
          success: false,
          error: 'Email already registered'
        },
        { status: 409 }
      );
    }

    // Create new user
    const { data: newUser, error } = await supabaseServer
      .from('app_users')
      .insert({
        username,
        email,
        password: hashedPassword,
        full_name,
        phone: phone || null,
        role: 'user',
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      {
        success: true,
        user: userWithoutPassword,
        message: 'Registration successful',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

