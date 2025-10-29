import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import crypto from 'crypto';

async function updateProfileHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentEmail, newEmail, newUsername, username, currentPassword, newPassword, avatarUrl } = body;
    
    // Support both 'username' and 'newUsername' for backward compatibility
    const usernameToUpdate = newUsername || username;

    if (!currentEmail) {
      return NextResponse.json(
        { success: false, error: 'Current email is required' },
        { status: 400 }
      );
    }

    // Get user by current email
    const { data: user, error: userError } = await supabaseServer
      .from('app_users')
      .select('*')
      .eq('email', currentEmail)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Update username if provided and different
    if (usernameToUpdate && usernameToUpdate !== user.username) {
      // Check if new username is already taken
      const { data: existingUser } = await supabaseServer
        .from('app_users')
        .select('id')
        .eq('username', usernameToUpdate)
        .neq('id', user.id)
        .single();

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Username already taken' },
          { status: 409 }
        );
      }

      updateData.username = usernameToUpdate;
    }

    // Update email if provided and different
    if (newEmail && newEmail !== user.email) {
      // Check if new email is already taken
      const { data: existingEmail } = await supabaseServer
        .from('app_users')
        .select('id')
        .eq('email', newEmail)
        .neq('id', user.id)
        .single();

      if (existingEmail) {
        return NextResponse.json(
          { success: false, error: 'Email already taken' },
          { status: 409 }
        );
      }

      updateData.email = newEmail;
    }

    // Update avatar if provided
    if (avatarUrl !== undefined) {
      updateData.avatar_url = avatarUrl;
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: 'Current password is required to change password' },
          { status: 400 }
        );
      }

      // Verify current password
      const hashedCurrentPassword = crypto.createHash('md5').update(currentPassword).digest('hex');
      if (hashedCurrentPassword !== user.password) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect' },
          { status: 401 }
        );
      }

      // Hash new password
      const hashedNewPassword = crypto.createHash('md5').update(newPassword).digest('hex');
      updateData.password = hashedNewPassword;
    }

    // Update user
    const { error: updateError } = await supabaseServer
      .from('app_users')
      .update(updateData)
      .eq('email', currentEmail);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      updatedUsername: usernameToUpdate || user.username,
      updatedEmail: newEmail || user.email
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}

// Export handler for POST method (for backward compatibility)
export async function POST(request: NextRequest) {
  return updateProfileHandler(request);
}

// Export handler for PUT method
export async function PUT(request: NextRequest) {
  return updateProfileHandler(request);
}

