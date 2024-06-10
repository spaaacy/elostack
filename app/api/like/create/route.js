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

    const requestData = await req.json();
    let results = await supabase.from("like").insert({ user_id: requestData.userId, post_id: requestData.postId });
    if (results.error) throw results.error;
    // if (requestData.postUserId !== requestData.userId) {
    let payload = null;
    if (requestData.projectTitle) payload = { projectTitle: requestData.projectTitle };
    results = await supabase.from("notification").insert({
      user_id: requestData.postUserId,
      project_id: requestData.projectId,
      payload,
      type: "like",
    });
    if (results.error) throw results.error;
    // }

    return NextResponse.json({ message: "Like created successfully!" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
