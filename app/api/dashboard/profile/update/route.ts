import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Block regular users from using this API - Dashboard users only
    const dashboardRoles = ['BUILDER', 'ADMIN', 'SUPER_ADMIN', 'SAAS_OWNER', 'TELECALLER', 'SALES_EXECUTIVE'];
    if (!dashboardRoles.includes(session.user.role)) {
      return NextResponse.json({ 
        message: 'Access denied. Please use the regular profile update endpoint.' 
      }, { status: 403 });
    }

    const { name, mobile, firmName, officeAddress } = await request.json();

    // Validate required fields
    if (!name || !mobile) {
      return NextResponse.json({ 
        message: 'Name and mobile are required' 
      }, { status: 400 });
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        mobile,
        projectName: firmName || null,
        propertyAddress: officeAddress || null,
      },
    });

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: {
        name: updatedUser.name,
        mobile: updatedUser.mobile,
        email: updatedUser.email,
        firmName: updatedUser.projectName,
        officeAddress: updatedUser.propertyAddress,
      }
    });
  } catch (error) {
    console.error('Dashboard profile update error:', error);
    return NextResponse.json({ 
      message: 'Failed to update profile' 
    }, { status: 500 });
  }
}
