import findCommonTime from "@/utils/findCommonTime";
import generateTimestamp from "@/utils/generateTimestamp";
import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
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

    const { userId, slots, meetingId, projectTitle, projectId } = await req.json();
    let results;
    for (let slot of slots) {
      const { data, error } = await supabase.rpc("create_meeting_availability", {
        p_user_id: userId,
        p_meeting_id: meetingId,
        p_start_time: slot.startTime,
        p_end_time: slot.endTime,
      });
      if (error) throw error;
      results = data;
    }

    // All members created availability
    const attendees = results.map((item) => ({ email: item.email }));
    if (results.length > 0) {
      const commonSlot = findCommonTime(results);
      if (commonSlot) {
        const url = "https://us-central1-elostack-418417.cloudfunctions.net/create-meeting";

        const data = {
          projectTitle,
          attendees: attendees,
          startTime: commonSlot.start_time,
          endTime: commonSlot.end_time,
        };

        const auth = new GoogleAuth(getGCPCredentials());
        const client = await auth.getIdTokenClient(url);
        const res = await client.request({ url: url, method: "POST", data });

        let results = await supabase
          .from("meeting")
          .update({ datetime: commonSlot.start_time, time_found: true, url: res.data.uri })
          .eq("id", meetingId);
        if (results.error) throw results.error;
        results = await supabase.rpc("create_notifications", {
          p_payload: { projectTitle, projectId, datetime: commonSlot.start_time },
          p_user_id: null,
          p_type: "meeting",
        });
        if (results.error) throw results.error;
      } else {
        const { error } = await supabase.from("meeting").update({ time_found: false }).eq("id", meetingId);
        if (error) throw error;
      }
    }

    return NextResponse.json({ message: "Meeting availability created successfully!" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
