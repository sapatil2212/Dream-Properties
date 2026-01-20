import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// DELETE: Delete an inquiry (Admin/Super Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    await prisma.contactInquiry.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Inquiry deleted successfully' });
  } catch (error) {
    console.error('Delete inquiry error:', error);
    return NextResponse.json(
      { message: 'Failed to delete inquiry' },
      { status: 500 }
    );
  }
}

// PATCH: Update inquiry (e.g., Assign Staff)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { assignedTo, salesExecutiveId } = body;

    const updateData: any = {};
    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo ? parseInt(assignedTo) : null;
    }
    if (salesExecutiveId !== undefined) {
      updateData.salesExecutiveId = salesExecutiveId ? parseInt(salesExecutiveId) : null;
    }

    const inquiry = await prisma.contactInquiry.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        assignedStaff: {
          select: { name: true, email: true }
        },
        salesExecutive: {
          select: { name: true, email: true }
        }
      }
    });

    return NextResponse.json(inquiry);
  } catch (error) {
    console.error('Update inquiry error:', error);
    return NextResponse.json(
      { message: 'Failed to update inquiry' },
      { status: 500 }
    );
  }
}
