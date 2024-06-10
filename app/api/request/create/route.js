import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req, res) {
  try {
    // Authentication
    const access_token = req.headers.get("x-supabase-auth").split(" ")[0];
    const refresh_token = req.headers.get("x-supabase-auth").split(" ")[1];
    if (!access_token || !refresh_token) throw Error("You must be authorized to do this action!");
    const auth = await supabase.auth.setSession({ access_token, refresh_token });
    if (auth.error) throw auth.error;

    const { userId, projectId, message, projectLeader, projectTitle } = await req.json();
    let results = await supabase.from("request").insert({ user_id: userId, project_id: projectId, message });
    if (results.error) throw results.error;
    results = await supabase.from("notification").insert({
      user_id: projectLeader,
      project_id: projectId,
      payload: { projectTitle, userId },
      type: "request-created",
    });
    if (results.error) throw results.error;

    return NextResponse.json({ message: "Request created successfully!" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
