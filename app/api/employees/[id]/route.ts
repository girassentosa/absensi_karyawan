import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

// GET /api/employees/[id] - Get employee by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { data, error } = await supabaseServer
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/employees/[id] - Update employee
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { full_name, email, phone, department, position, is_active, face_encoding_path } = body;

    // Check if employee exists
    const { data: existing } = await supabaseServer
      .from('employees')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Check if email is being changed and is unique
    if (email) {
      const { data: emailExists } = await supabaseServer
        .from('employees')
        .select('id')
        .eq('email', email)
        .neq('id', id)
        .single();

      if (emailExists) {
        return NextResponse.json(
          { success: false, error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    // Update employee
    const { data, error } = await supabaseServer
      .from('employees')
      .update({
        full_name,
        email,
        phone,
        department,
        position,
        is_active,
        face_encoding_path,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      data 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/employees/[id] - Toggle Status (Activate/Deactivate)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (!['activate', 'deactivate'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "activate" or "deactivate"' },
        { status: 400 }
      );
    }

    // Check if employee exists
    const { data: existing, error: checkError } = await supabaseServer
      .from('employees')
      .select('id, user_id, full_name, email, is_active')
      .eq('id', id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }

    const isActivating = action === 'activate';
    const newStatus = isActivating;

    console.log(`=== ${isActivating ? 'ACTIVATE' : 'DEACTIVATE'} EMPLOYEE START ===`);
    console.log(`${isActivating ? 'Activating' : 'Deactivating'} employee:`, existing.full_name, existing.email);

    // Update is_active status
    const { error: empError } = await supabaseServer
      .from('employees')
      .update({ 
        is_active: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (empError) {
      console.error(`Error ${isActivating ? 'activating' : 'deactivating'} employee:`, empError);
      throw new Error(`Failed to ${action} employee`);
    }

    console.log(`✓ Employee ${isActivating ? 'activated' : 'deactivated'}`);

    // Also update user account status
    if (existing.user_id) {
      const { error: userError } = await supabaseServer
        .from('app_users')
        .update({ 
          is_active: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.user_id);

      if (userError) {
        console.error(`Error ${isActivating ? 'activating' : 'deactivating'} user:`, userError);
      } else {
        console.log(`✓ User account ${isActivating ? 'activated' : 'deactivated'}`);
      }
    }

    console.log('=== STATUS TOGGLE COMPLETE ===');

    return NextResponse.json({ 
      success: true,
      message: `Employee ${isActivating ? 'activated' : 'deactivated'} successfully`,
      data: { 
        id, 
        name: existing.full_name,
        email: existing.email,
        is_active: newStatus
      }
    });
  } catch (error: any) {
    console.error('PATCH employee error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to toggle employee status' },
      { status: 500 }
    );
  }
}

// DELETE /api/employees/[id] - HARD DELETE - Permanently remove from database
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if employee exists
    const { data: existing, error: checkError } = await supabaseServer
      .from('employees')
      .select('id, user_id, full_name, email')
      .eq('id', id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }

    console.log('=== HARD DELETE START ===');
    console.log('Deleting employee:', existing.full_name, existing.email);

    // CRITICAL: Delete user first (CASCADE will auto-delete employee and attendance)
    // Based on schema: user_id → app_users(id) ON DELETE CASCADE
    if (existing.user_id) {
      const { error: userError } = await supabaseServer
        .from('app_users')
        .delete()
        .eq('id', existing.user_id);

      if (userError) {
        console.error('Error deleting user:', userError);
        throw new Error('Failed to delete user account: ' + userError.message);
      }
      console.log('✓ User deleted (CASCADE will delete employee & attendance)');
    } else {
      // If no user_id, delete employee directly (attendance will CASCADE)
      const { error: empError } = await supabaseServer
        .from('employees')
        .delete()
        .eq('id', id);

      if (empError) {
        console.error('Error deleting employee:', empError);
        throw new Error('Failed to delete employee: ' + empError.message);
      }
      console.log('✓ Employee deleted (CASCADE will delete attendance)');
    }

    // Verify complete deletion
    const { data: checkEmp } = await supabaseServer
      .from('employees')
      .select('id')
      .eq('email', existing.email)
      .single();

    const { data: checkUser } = await supabaseServer
      .from('app_users')
      .select('id')
      .eq('email', existing.email)
      .single();

    console.log('✓ Verification - Employee exists:', !!checkEmp);
    console.log('✓ Verification - User exists:', !!checkUser);
    console.log('=== HARD DELETE COMPLETE ===');

    return NextResponse.json({ 
      success: true,
      message: 'Employee permanently deleted from database',
      data: { 
        id, 
        name: existing.full_name,
        email: existing.email
      }
    });
  } catch (error: any) {
    console.error('DELETE employee error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete employee' },
      { status: 500 }
    );
  }
}

