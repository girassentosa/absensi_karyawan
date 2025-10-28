import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

// GET /api/office-locations - Get all office locations
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseServer
      .from('office_locations')
      .select('*')
      .order('created_at', { ascending: false });

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

// POST /api/office-locations - Create new office location
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, address, latitude, longitude, radius } = body;

    // Validate required fields
    if (!name || !latitude || !longitude) {
      return NextResponse.json(
        { success: false, error: 'name, latitude, and longitude are required' },
        { status: 400 }
      );
    }

    // Insert new office location
    const { data, error } = await supabaseServer
      .from('office_locations')
      .insert({
        name,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius: radius ? parseInt(radius) : 100,
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

