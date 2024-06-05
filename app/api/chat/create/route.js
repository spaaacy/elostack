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

    const { chat, projectTitle } = await req.json();
    let results = await supabase.from("chat").insert(chat);
    if (results.error) throw results.error;
    results = await supabase.rpc("create_notifications", {
      p_user_id: chat.user_id,
      p_project_id: chat.project_id,
      p_payload: { type: "chat", projectTitle },
    });
    if (results.error) throw results.error;

    return NextResponse.json({ message: "Message created successfully!" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
