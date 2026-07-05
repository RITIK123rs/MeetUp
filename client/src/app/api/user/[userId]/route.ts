import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/lib/dbConnection";
import user from "@/models/user";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  await connectDB();

  const {userId}= await params;

  await user.findByIdAndUpdate(userId, {
    $inc: { videoChatNo: 1 },
  });

  return NextResponse.json({ success: true });
}