import { NextResponse } from 'next/server';
import { prisma, ensureDefaultItems } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureDefaultItems();
    const items = await prisma.item.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Failed to fetch items:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, id, name, price, active, description } = body;

    if (action === 'create') {
      if (!name || price === undefined) {
        return NextResponse.json({ success: false, error: 'Name and price are required' }, { status: 400 });
      }
      const count = await prisma.item.count();
      const newItem = await prisma.item.create({
        data: {
          name: name.trim(),
          price: parseFloat(price),
          description: description || null,
          sortOrder: count + 1,
          active: active !== undefined ? active : true,
        },
      });
      return NextResponse.json({ success: true, item: newItem });
    }

    if (action === 'update') {
      if (!id) {
        return NextResponse.json({ success: false, error: 'Item ID is required' }, { status: 400 });
      }
      const updatedItem = await prisma.item.update({
        where: { id },
        data: {
          ...(name !== undefined && { name: name.trim() }),
          ...(price !== undefined && { price: parseFloat(price) }),
          ...(description !== undefined && { description }),
          ...(active !== undefined && { active }),
        },
      });
      return NextResponse.json({ success: true, item: updatedItem });
    }

    if (action === 'toggleActive') {
      if (!id) {
        return NextResponse.json({ success: false, error: 'Item ID is required' }, { status: 400 });
      }
      const existing = await prisma.item.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
      }
      const updatedItem = await prisma.item.update({
        where: { id },
        data: { active: !existing.active },
      });
      return NextResponse.json({ success: true, item: updatedItem });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error modifying items:', error);
    return NextResponse.json({ success: false, error: 'Failed to update inventory' }, { status: 500 });
  }
}
