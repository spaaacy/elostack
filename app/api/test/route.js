import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req, res) {
  try {
    const response = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.SLACK_APP_OAUTH_TOKEN}` },
      body: JSON.stringify({
        channel: "C07BGU5R0DP",
        blocks: [{ type: "section", text: { type: "mrkdwn", text: "this is a <https://www.stackoverflow.com|link>" } }],
      }),
    });
    const result = await response.json();
    if (result.ok === false) {
      throw result.error;
    }

    return NextResponse.json({ message: "okay" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
