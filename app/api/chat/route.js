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

    const { projectId, pageNumber } = await req.json();
    const { data, error } = await supabase.rpc("get_messages", {
      p_project_id: projectId,
      p_page_size: 15,
      p_page_number: pageNumber ? pageNumber : 1,
    });

    if (error) throw error;
    return NextResponse.json({ chat: data }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
