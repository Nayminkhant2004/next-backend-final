import { NextResponse } from "next/server";
import { getClientPromise } from "@/lib/mongodb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Credentials": "true",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function PATCH(req, { params }) {
  const { id } = params;
  const client = await getClientPromise();
  const db = client.db();

  const result = await db.collection("books").updateOne(
    { _id: id, quantity: { $gt: 0 } },
    { $inc: { quantity: -1 } }
  );

  if (result.modifiedCount === 0) {
    return NextResponse.json({ message: "Out of stock" }, { status: 400, headers: corsHeaders });
  }

  // Log the request for the "Requests" page
  await db.collection("requests").insertOne({
    bookId: id,
    status: "BORROWED",
    date: new Date()
  });

  return NextResponse.json({ success: true }, { headers: corsHeaders });
}