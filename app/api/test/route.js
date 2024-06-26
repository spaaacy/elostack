import { NextRequest, NextResponse } from "next/server";
const { GoogleAuth } = require("google-auth-library");

export async function POST(req, res) {
  const data = await req.json();
  try {
    const url = "https://us-central1-elostack-418417.cloudfunctions.net/create-meeting";

    const auth = new GoogleAuth();
    const client = await auth.getIdTokenClient(url);
    const res = await client.request({ url: `${url}/create-meeting`, method: "POST", data });

    return NextResponse.json(res.data, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
