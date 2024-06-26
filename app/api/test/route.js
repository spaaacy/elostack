import { GoogleAuth } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";

async function callCloudFunction() {
  const functionUrl = "https://us-central1-elostack-418417.cloudfunctions.net/create-meeting";

  try {
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjJhZjkwZTg3YmUxNDBjMjAwMzg4OThhNmVmYTExMjgzZGFiNjAzMWQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiNjE4MTA0NzA4MDU0LTlyOXMxYzRhbGczNmVybGl1Y2hvOXQ1Mm4zMm42ZGdxLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiNjE4MTA0NzA4MDU0LTlyOXMxYzRhbGczNmVybGl1Y2hvOXQ1Mm4zMm42ZGdxLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTA0NzA0NDAyMDUxMjI3MTc0NjI4IiwiaGQiOiJlbG9zdGFjay5jb20iLCJlbWFpbCI6ImFha2lmbW9oYW1lZEBlbG9zdGFjay5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6IjZTUlNrcDFfd0FRYmk0OWRwZ1pUclEiLCJuYmYiOjE3MTkzNjAwNjAsImlhdCI6MTcxOTM2MDM2MCwiZXhwIjoxNzE5MzYzOTYwLCJqdGkiOiJkNzM1NzdlYjZlM2RiOTc4NTljNzU1MTY2MjI1OTA4N2U4ZjBhYzM3In0.zybKbPJMn46bBeIY5e-XPGIkU-pnLiu8NO1kyfpkqhI77COuoMuX9OnXyBsTB2aDOeqqU2BZEAI9w4VRF8JwPUO77H5SeiJxIop3MX8mYacsjYT4ar1usE3Gq14NRiF1RNRRYrt0lAFJCpM90wgb9MR1a7bMp36acgF8DJu6C28gnno1_2vVRlFAVu7SWsMKOMWZmKt3Se1Q3KbSIEd9NcqNlwgXnT-e0s_VQuAwDLQLUVygcDqgQ6M0knKifXfKOa70FymUOCbsjyzLK7ROW9FsGQ1N4loD1A_j04yV6xQU7PXwqxAX8AzF0dkGatIUk0d-egIgFM-ykTCFPNTWIA`,
      },
      body: JSON.stringify({
        projectTitle: "SkillShare",
        startTime: "2024-06-28T09:00:00-07:00",
        endTime: "2024-06-29T09:00:00-07:00",
        attendees: [
          {
            email: "aakifmohamed1952@gmail.com",
          },
        ],
      }),
    });

    return response;
  } catch (error) {
    console.error("Error calling Cloud Function:", error);
    throw error;
  }
}
export async function POST(req, res) {
  try {
    // Cloud Functions uses your function's url as the `targetAudience` value

    const targetAudience = "https://us-central1-elostack-418417.cloudfunctions.net/create-meeting";

    // For Cloud Functions, endpoint(`url`) and `targetAudience` should be equal

    const url = targetAudience;

    const { GoogleAuth } = require("google-auth-library");
    const auth = new GoogleAuth();

    async function request() {
      console.info(`request ${url} with target audience ${targetAudience}`);

      // this call retrieves the ID token for the impersonated service account
      const client = await auth.getIdTokenClient(targetAudience);

      const res = await client.request({ url });
      console.info(res.data);
    }

    request().catch((err) => {
      console.error(err.message);
      process.exitCode = 1;
    });

    // const result = await callCloudFunction();
    // console.log(result);
    // res.status(200).json(result);
    return NextResponse.json({ message: "Meeting availability created successfully!" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
    // res.status(500).json({ error: "Error calling Cloud Function" });
  }
}
