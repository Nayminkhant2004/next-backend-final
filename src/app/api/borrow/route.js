import { NextResponse } from "next/server";
import { getClientPromise } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { verifyAuth } from "@/lib/auth";
import corsHeaders from "@/lib/cors";

export async function OPTIONS(req) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET(req) {
  const auth = await verifyAuth(req);
  if (auth.error) {
    return NextResponse.json({ message: auth.message }, { status: auth.status, headers: corsHeaders });
  }

  try {
    const client = await getClientPromise();
    const db = client.db();
    
    // Admins see all requests. Normal users only see their own.
    const query = auth.user.role === "ADMIN" ? {} : { userId: auth.user.id };
    
    const requests = await db.collection("borrowRequests").find(query).toArray();

    return NextResponse.json(requests, { status: 200, headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(req) {
  const auth = await verifyAuth(req);
  if (auth.error) {
    return NextResponse.json({ message: auth.message }, { status: auth.status, headers: corsHeaders });
  }

  try {
    const data = await req.json();
    const client = await getClientPromise();
    const db = client.db();

    // Create the borrowing request with required fields
    const newRequest = {
      userId: auth.user.id,
      bookId: data.bookId,
      createdAt: new Date().toISOString(),
      targetDate: data.targetDate,
      status: "INIT" // Starts at INIT by default
    };

    const result = await db.collection("borrowRequests").insertOne(newRequest);

    return NextResponse.json(
      { message: "Borrow request created successfully", id: result.insertedId }, 
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500, headers: corsHeaders });
  }
}

export async function PATCH(req) {
  // Only ADMIN can update the request status
  const auth = await verifyAuth(req, ["ADMIN"]);
  if (auth.error) {
    return NextResponse.json({ message: auth.message }, { status: auth.status, headers: corsHeaders });
  }

  try {
    const data = await req.json();
    const { requestId, status } = data;
    
    const client = await getClientPromise();
    const db = client.db();
    
    const result = await db.collection("borrowRequests").updateOne(
      { _id: new ObjectId(requestId) },
      { $set: { status: status } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Request not found" }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({ message: "Request status updated" }, { status: 200, headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500, headers: corsHeaders });
  }
}