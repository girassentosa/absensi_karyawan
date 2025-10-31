import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Force dynamic rendering - no caching for real-time data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    
    const employeeId = searchParams.get('employee_id');
    const status = searchParams.get('status');
    const userId = searchParams.get('user_id');
    const date = searchParams.get('date'); // Filter for specific date (YYYY-MM-DD)

    // Base query with employee and admin info
    let query = supabaseServer
      .from('leave_requests')
      .select(`
        *,
        employees!leave_requests_employee_id_fkey (
          id,
          employee_code,
          full_name,
          email,
          department,
          position,
          app_users!employees_user_id_fkey (
            avatar_url
          )
        ),
        app_users!leave_requests_reviewed_by_fkey (
          full_name,
          username
        )
      `)
      .order('created_at', { ascending: false });

    // Filter by employee_id if provided
    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    // Filter by user_id (get employee_id from user_id first)
    if (userId && !employeeId) {
      const { data: employeeData, error: employeeError } = await supabaseServer
        .from('employees')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (employeeError || !employeeData) {
        return NextResponse.json({ 
          success: false, 
          message: 'Employee not found for this user' 
        }, { status: 404 });
      }

      query = query.eq('employee_id', employeeData.id);
    }

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Filter by date if provided (check if date falls within start_date and end_date range)
    if (date) {
      query = query.lte('start_date', date).gte('end_date', date);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching leave requests:', error);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to fetch leave requests',
        error: error.message 
      }, { status: 500 });
    }

    // Flatten the data structure
    const flattenedData = data?.map((request: any) => ({
      id: request.id,
      employee_id: request.employee_id,
      employee_name: request.employees?.full_name || 'Unknown',
      employee_code: request.employees?.employee_code || '-',
      employee_email: request.employees?.email || '-',
      department: request.employees?.department || '-',
      position: request.employees?.position || '-',
      avatar_url: request.employees?.app_users?.avatar_url || null,
      leave_type: request.leave_type,
      start_date: request.start_date,
      end_date: request.end_date,
      days: request.days,
      reason: request.reason,
      attachment_url: request.attachment_url,
      status: request.status,
      admin_notes: request.admin_notes,
      reviewed_by: request.reviewed_by,
      reviewed_by_name: request.app_users?.full_name || null,
      reviewed_at: request.reviewed_at,
      created_at: request.created_at,
      updated_at: request.updated_at
    })) || [];

    return NextResponse.json({ 
      success: true, 
      data: flattenedData 
    });

  } catch (error: any) {
    console.error('Error in GET /api/leave-requests:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();

    const { 
      user_id,
      leave_type, 
      start_date, 
      end_date, 
      reason,
      attachment_url 
    } = body;

    // Validate required fields
    if (!user_id || !leave_type || !start_date || !end_date || !reason) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields' 
      }, { status: 400 });
    }

    // Get employee_id from user_id
    const { data: employeeData, error: employeeError } = await supabaseServer
      .from('employees')
      .select('id')
      .eq('user_id', user_id)
      .single();

    if (employeeError || !employeeData) {
      return NextResponse.json({ 
        success: false, 
        message: 'Employee not found for this user' 
      }, { status: 404 });
    }

    // Calculate days
    // 30 Oct to 31 Oct = 1 day (not 2)
    // Same day = 1 day
    const startDateObj = new Date(start_date);
    const endDateObj = new Date(end_date);
    const diffTime = endDateObj.getTime() - startDateObj.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const days = diffDays === 0 ? 1 : (diffDays > 0 ? diffDays : 1);

    // Insert leave request
    const { data, error } = await supabaseServer
      .from('leave_requests')
      .insert({
        employee_id: employeeData.id,
        leave_type,
        start_date,
        end_date,
        days,
        reason,
        attachment_url: attachment_url || null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating leave request:', error);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to create leave request',
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Leave request submitted successfully',
      data 
    });

  } catch (error: any) {
    console.error('Error in POST /api/leave-requests:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();

    const { 
      id,
      status,
      admin_notes,
      reviewed_by 
    } = body;

    // Validate required fields
    if (!id || !status || !reviewed_by) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields (id, status, reviewed_by)' 
      }, { status: 400 });
    }

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid status. Must be "approved" or "rejected"' 
      }, { status: 400 });
    }

    // Update leave request
    const { data, error } = await supabaseServer
      .from('leave_requests')
      .update({
        status,
        admin_notes: admin_notes || null,
        reviewed_by,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating leave request:', error);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to update leave request',
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Leave request ${status} successfully`,
      data 
    });

  } catch (error: any) {
    console.error('Error in PUT /api/leave-requests:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    }, { status: 500 });
  }
}

