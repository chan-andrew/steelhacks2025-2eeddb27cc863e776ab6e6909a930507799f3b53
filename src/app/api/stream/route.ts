import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// This route should not be statically generated
export const dynamic = 'force-dynamic';

export async function GET() {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  // Watch with fullDocument option to get the complete document with the machine's id field
  const changeStream = db.collection("Machines").watch([], { 
    fullDocument: 'updateLookup' 
  });

  // Create a ReadableStream to push events to client
  const stream = new ReadableStream({
    start(controller) {
      changeStream.on("change", (next) => {
        controller.enqueue(
          `data: ${JSON.stringify(next)}\n\n`
        );
      });
    },
    cancel() {
      changeStream.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
