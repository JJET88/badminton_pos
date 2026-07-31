import { NextResponse } from "next/server";

export async function POST() {
  console.log("👋 /api/auth/logout - Logging out user");

  const response = NextResponse.json(
    { success: true, message: "Logged out successfully" },
    { status: 200 }
  );

  // Clear the token cookie by setting its expiration date in the past
  response.cookies.set({
    name: "token",
    value: "",
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}
