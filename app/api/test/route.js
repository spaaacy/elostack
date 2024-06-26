import { NextRequest, NextResponse } from "next/server";
const { GoogleAuth } = require("google-auth-library");

export async function POST(req, res) {
  const data = await req.json();
  try {
    // Cloud Functions uses your function's url as the `targetAudience` value
    const targetAudience = "https://us-central1-elostack-418417.cloudfunctions.net/create-meeting";

    // For Cloud Functions, endpoint(`url`) and `targetAudience` should be equal
    const url = targetAudience;

    const auth = new GoogleAuth();

    const client = await auth.getIdTokenClient(targetAudience);
    const res = await client.request({ url: `${url}/create-meeting`, method: "POST", data });

    return NextResponse.json(res.data, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
