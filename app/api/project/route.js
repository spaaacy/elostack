export const dynamic = "force-dynamic";

import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req, res) {
  try {
    // Authentication
    const auth = await supabase.auth.signInWithPassword({
      email: process.env.SUPABASE_ADMIN_EMAIL,
      password: process.env.SUPABASE_ADMIN_PASSWORD,
    });
    if (auth.error) throw auth.error;

    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      console.log("Request body is empty or not in JSON format.");
    }

    let results;
    if (requestBody) {
      results = await supabase.rpc("get_projects_with_total_members", { p_user_id: requestBody.userId });
      if (results.error) throw results.error;
    } else {
      results = await supabase.rpc("get_projects_with_total_members");
      if (results.error) throw results.error;
    }
    return NextResponse.json({ projects: results.data }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
