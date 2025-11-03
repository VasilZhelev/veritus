import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/admin";

export async function POST(req: Request) {
  const { token } = await req.json();

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return NextResponse.json({ uid: decoded.uid, email: decoded.email });
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
