import { NextResponse, NextRequest } from "next/server";

interface UserResponse {
    success: boolean,
    name: string,
    email: string,
    picture: string,
}

export async function POST(req: NextRequest) {
  console.log("Google auth");
  try {
    const { token } = await req.json();
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const userData = await response.json();
    console.log(userData);
    const result: UserResponse = {
      success: true,
      name: userData.name,
      email: userData.email,
      picture: userData.picture,
    };
    return NextResponse.json(result);
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      success: false,
    });
  }
}
