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

    async function request() {
      console.info(`request ${url} with target audience ${targetAudience}`);

      // this call retrieves the ID token for the impersonated service account
      const client = await auth.getIdTokenClient(targetAudience);
      console.log(targetAudience);

      const res = await client.request({ url: `${url}/create-meeting`, method: "POST", data });
      console.info(res.data);
    }

    request().catch((err) => {
      console.error(err.message);
      process.exitCode = 1;
    });

    return NextResponse.json({ message: "Meeting availability created successfully!" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
