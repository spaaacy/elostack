import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req, res) {
  try {
    // Authentication
    const access_token = req.headers.get("x-supabase-auth").split(" ")[0];
    const refresh_token = req.headers.get("x-supabase-auth").split(" ")[1];
    if (!access_token || !refresh_token) throw Error("You must be authorized to do this action!");
    const auth = await supabase.auth.setSession({ access_token, refresh_token });
    if (auth.error) throw auth.error;

    const { userId, member, requestId, projectTitle } = await req.json();
    let results = await supabase.from("request").update({ accepted: true }).eq("id", requestId);
    if (results.error) throw results.error;
    results = await supabase.from("member").insert(member);
    if (results.error) throw results.error;
    results = await supabase.rpc("create_notifications", {
      p_user_id: userId,
      p_project_id: member.project_id,
      p_payload: { type: "request", userId: member.user_id, accepted: true, projectTitle },
    });
    if (results.error) throw results.error;

    return NextResponse.json({ message: "Request changed successfully!" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
