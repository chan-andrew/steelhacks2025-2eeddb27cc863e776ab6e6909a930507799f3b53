import { NextRequest, NextResponse } from 'next/server';
import { findNearest, MachineNode } from '@/lib/findClosestMachine';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { machineName, currentPosition } = await request.json();
    
    const searchFrom: MachineNode = {
      id: 0,
      name: 'Current Position',
      floor: currentPosition.floor,
      x: currentPosition.x,
      y: currentPosition.y,
      in_use: false,
      muscles: []
    };

    const result = await findNearest(machineName, searchFrom);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error finding closest machine:', error);
    return NextResponse.json({ error: 'Failed to find closest machine' }, { status: 500 });
  }
}
