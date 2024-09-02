import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";
import getGCPCredentials from "@/utils/getGCPCredentials";
const { GoogleAuth } = require("google-auth-library");

export async function POST(req, res) {
  try {
    // Authentication
    const access_token = req.headers.get("x-supabase-auth").split(" ")[0];
    const refresh_token = req.headers.get("x-supabase-auth").split(" ")[1];
    if (!access_token || !refresh_token) throw Error("You must be authorized to do this action!");
    const auth = await supabase.auth.setSession({ access_token, refresh_token });
    if (auth.error) throw auth.error;

    const url = "https://us-central1-elostack-418417.cloudfunctions.net/create-meeting";

    const { projectTitle, attendees, startTime, endTime, projectId, meetingId } = await req.json();
    const googleAuth = new GoogleAuth(getGCPCredentials());
    const client = await googleAuth.getIdTokenClient(url);
    const res = await client.request({
      url: url,
      method: "POST",
      data: {
        projectTitle,
        attendees,
        startTime,
        endTime,
      },
    });

    let results = await supabase
      .from("meeting")
      .update({ datetime: startTime, time_found: true, url: res.data.uri })
      .eq("id", meetingId);
    if (results.error) throw results.error;
    results = await supabase.rpc("create_notifications", {
      p_payload: { projectTitle, projectId, datetime: startTime },
      p_user_id: null,
      p_type: "meeting",
    });
    if (results.error) throw results.error;

    return NextResponse.json({ message: "Meeting link created successfully!", url: res.data.uri }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
