import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const machines = await db
      .collection("Machines")
      .find({})
      .toArray();

    // Convert MongoDB documents to the expected format
    const formattedMachines = machines.map((machine) => ({
      _id: machine._id.toString(),
      id: machine.id || parseInt(machine._id?.toString()) || 0,
      name: machine.name || "",
      floor: machine.floor || 1,
      x: machine.x || 0,
      y: machine.y || 0,
      in_use: machine.in_use || machine.isInUse || false,
      muscles: machine.muscles || [],
    }));
    
    return NextResponse.json(formattedMachines);
  } catch (error) {
    console.error('Error loading machines:', error);
    return NextResponse.json({ error: 'Failed to load machines' }, { status: 500 });
  }
}
