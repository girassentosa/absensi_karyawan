import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

// GET /api/employees - Get all employees or filter by email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const showInactive = searchParams.get('showInactive') === 'true';

    let query = supabaseServer.from('employees').select('*');
    
    // Only show active employees by default
    if (!showInactive) {
      query = query.eq('is_active', true);
    }
    
    if (email) {
      query = query.eq('email', email);
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      data: data || []
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/employees - Create new employee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, employee_code, full_name, email, phone, department, position, hire_date } = body;

    // Validate required fields
    if (!employee_code || !full_name || !email) {
      return NextResponse.json(
        { success: false, error: 'employee_code, full_name, and email are required' },
        { status: 400 }
      );
    }

    // Check if employee code already exists
    const { data: existingCode } = await supabaseServer
      .from('employees')
      .select('id')
      .eq('employee_code', employee_code)
      .single();

    if (existingCode) {
      return NextResponse.json(
        { success: false, error: 'Employee code already exists' },
        { status: 400 }
      );
    }

    // Check if email already exists in employees table
    const { data: existingEmail } = await supabaseServer
      .from('employees')
      .select('id')
      .eq('email', email)
      .single();

    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Insert new employee
    const { data, error } = await supabaseServer
      .from('employees')
      .insert({
        user_id,
        employee_code,
        full_name,
        email,
        phone,
        department,
        position,
        hire_date,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      data 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

