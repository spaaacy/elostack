import generateTimestamp from "@/utils/generateTimestamp";
import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req, res) {
  try {
    // Authentication
    const access_token = req.headers.get("x-supabase-auth").split(" ")[0];
    const refresh_token = req.headers.get("x-supabase-auth").split(" ")[1];
    if (!access_token || !refresh_token) throw Error("You must be authorized to do this action!");
    const auth = await supabase.auth.setSession({ access_token, refresh_token });
    if (auth.error) throw auth.error;

    const { userId, slots, meetingId } = await req.json();
    for (let slot of slots) {
      const { error } = await supabase
        .from("meeting_availability")
        .insert({ user_id: userId, meeting_id: meetingId, start_time: slot.startTime, end_time: slot.endTime });
      if (error) throw error;
    }

    return NextResponse.json({ message: "Meeting availability created successfully!" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
