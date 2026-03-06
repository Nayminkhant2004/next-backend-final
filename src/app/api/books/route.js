import { NextResponse } from "next/server";
import { getClientPromise } from "@/lib/mongodb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  const client = await getClientPromise();
  const db = client.db();
  const books = await db.collection("books").find({}).toArray();
  return NextResponse.json(books, { status: 200, headers: corsHeaders });
}

export async function POST(req) {
  const data = await req.json();
  const client = await getClientPromise();
  const db = client.db();
  const result = await db.collection("books").insertOne(data);
  return NextResponse.json({ ...data, _id: result.insertedId }, { status: 201, headers: corsHeaders });
}