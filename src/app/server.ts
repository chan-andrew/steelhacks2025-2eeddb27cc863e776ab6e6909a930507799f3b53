'use server';

import clientPromise from "@/lib/mongodb";
import { setMachineInUse, setMachineNotInUse } from "@/lib/updateInUse";
import { findNearest } from "@/lib/findClosestMachine";

export async function getMachines() {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const posts = await db.collection("Machines").find({}).toArray();
        
        // Convert MongoDB objects to plain objects, removing problematic _id field
        return posts.map(machine => ({
            id: machine.id,
            name: machine.name,
            floor: machine.floor,
            in_use: machine.in_use,
            x: machine.x,
            y: machine.y,
            muscles: machine.muscles
        }));
    } catch (error) {
        console.error('Error getting machines:', error);
        throw new Error('Failed to retrieve machines');
    }
}

export { setMachineNotInUse, setMachineInUse, findNearest };



