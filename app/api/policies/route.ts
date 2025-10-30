import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

// GET /api/policies - Get all policies
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category'); // Optional: filter by category

    let query = supabaseServer
      .from('policies')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true });

    if (category) {
      query = query.eq('category', category);
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

// POST /api/policies - Create new policy
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, policy_data } = body;

    if (!title || !description || !category) {
      return NextResponse.json(
        { success: false, error: 'title, description, and category are required' },
        { status: 400 }
      );
    }

    if (!['attendance', 'leave', 'general'].includes(category)) {
      return NextResponse.json(
        { success: false, error: 'category must be "attendance", "leave", or "general"' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from('policies')
      .insert({
        title,
        description,
        category,
        policy_data: policy_data || null,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Policy created successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/policies - Update policy
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, category, policy_data, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id is required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) {
      if (!['attendance', 'leave', 'general'].includes(category)) {
        return NextResponse.json(
          { success: false, error: 'category must be "attendance", "leave", or "general"' },
          { status: 400 }
        );
      }
      updateData.category = category;
    }
    if (policy_data !== undefined) updateData.policy_data = policy_data;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabaseServer
      .from('policies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Policy updated successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/policies - Delete policy
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
      .from('policies')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      message: 'Policy deleted successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

