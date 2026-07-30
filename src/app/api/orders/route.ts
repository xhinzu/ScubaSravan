import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { APP_CONFIG } from '@/config/appConfig';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, note, items, totalAmount } = body;

    if (!customerName || !customerName.trim()) {
      return NextResponse.json({ success: false, error: 'Customer name is required' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Order must contain at least one item' }, { status: 400 });
    }

    const newOrder = await prisma.order.create({
      data: {
        customerName: customerName.trim(),
        note: note ? note.trim() : null,
        totalAmount: parseFloat(totalAmount) || 0,
        status: 'pending',
        itemsJson: JSON.stringify(items),
      },
    });

    return NextResponse.json({
      success: true,
      order: newOrder,
      famPayLink: APP_CONFIG.famPayLink,
    });
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
  }
}
