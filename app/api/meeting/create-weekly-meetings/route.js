import getNextWeekendDates from "@/utils/getNextWeekendDates";
import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req, res) {
  try {
    // Cron Authentication
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      if (authHeader.split(" ")[1] !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Supabase Authentication
    const auth = await supabase.auth.signInWithPassword({
      email: process.env.SUPABASE_ADMIN_EMAIL,
      password: process.env.SUPABASE_ADMIN_PASSWORD,
    });
    if (auth.error) throw auth.error;

    const nextWeekendDates = getNextWeekendDates();
    let results = await supabase.rpc("create_meeting_for_in_progress_projects", {
      p_datetime: nextWeekendDates.nextSunday,
    });
    if (results.error) throw results.error;

    return NextResponse.json({ message: "Meeting created successfully!" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
