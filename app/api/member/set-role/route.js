import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req, res) {
  try {
    // Authentication
    const access_token = req.headers.get("x-supabase-auth").split(" ")[0];
    const refresh_token = req.headers.get("x-supabase-auth").split(" ")[1];
    if (!access_token || !refresh_token) throw Error("You must be authorized to do this action!");
    const auth = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if (auth.error) throw auth.error;

    const { userId, projectId, role } = await req.json();
    const { error } = await supabase.from("member").update({ role }).match({ project_id: projectId, user_id: userId });
    if (error) throw error;

    return NextResponse.json({ message: "Role set successfully!" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
