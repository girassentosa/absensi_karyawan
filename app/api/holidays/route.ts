import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

// GET /api/holidays - Get all holidays
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date'); // Optional: check specific date

    let query = supabaseServer
      .from('holidays')
      .select('*')
      .eq('is_active', true)
      .order('date', { ascending: true });

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query;

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

// POST /api/holidays - Create new holiday
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, date, type, description } = body;

    if (!name || !date || !type) {
      return NextResponse.json(
        { success: false, error: 'name, date, and type are required' },
        { status: 400 }
      );
    }

    if (!['national', 'company'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'type must be either "national" or "company"' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from('holidays')
      .insert({
        name,
        date,
        type,
        description: description || null,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Holiday created successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/holidays - Update holiday
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, date, type, description, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id is required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name;
    if (date !== undefined) updateData.date = date;
    if (type !== undefined) {
      if (!['national', 'company'].includes(type)) {
        return NextResponse.json(
          { success: false, error: 'type must be either "national" or "company"' },
          { status: 400 }
        );
      }
      updateData.type = type;
    }
    if (description !== undefined) updateData.description = description;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabaseServer
      .from('holidays')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Holiday updated successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/holidays - Delete holiday
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseServer
      .from('holidays')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      message: 'Holiday deleted successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

