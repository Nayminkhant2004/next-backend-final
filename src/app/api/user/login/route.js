import { NextResponse } from "next/server";
import { sign } from "jsonwebtoken";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Credentials": "true",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req) {
  const { email, password } = await req.json();
  const users = [
    { email: "admin@test.com", password: "admin123", role: "ADMIN", id: "admin_1" },
    { email: "user@test.com", password: "user123", role: "USER", id: "user_1" }
  ];

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return NextResponse.json({ message: "Invalid credentials" }, { status: 401, headers: corsHeaders });

  const token = sign({ id: user.id, email: user.email, role: user.role }, "myjwtsecret", { expiresIn: "1h" });
  const response = NextResponse.json({ user: { email: user.email, role: user.role } }, { headers: corsHeaders });

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });

  return response;
}