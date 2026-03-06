import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";

export async function verifyAuth(req, allowedRoles = []) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return { error: true, message: "No session found", status: 401 };
  }

  try {
    // This decodes the real JWT token you signed in login/route.js
    const decoded = verify(token, process.env.JWT_SECRET || "myjwtsecret");
    
    // Check if the user has the required role
    if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
      return { error: true, message: "Forbidden: Insufficient permissions", status: 403 };
    }

    // Return the user data so the Borrow route can use decoded.id
    return { error: false, user: decoded };
  } catch (err) {
    return { error: true, message: "Invalid or expired session", status: 401 };
  }
}