import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req, res) {
  try {
    // Authentication
    const access_token = req.headers.get("x-supabase-auth").split(" ")[0];
    const refresh_token = req.headers.get("x-supabase-auth").split(" ")[1];
    if (!access_token || !refresh_token) throw Error("You must be authorized to do this action!");
    const auth = await supabase.auth.setSession({ access_token, refresh_token });
    if (auth.error) throw auth.error;

    const { project } = await req.json();

    let results = await supabase.from("member").delete().match({ project_id: project.id, user_id: project.leader });
    if (results.error) throw results.error;

    results = await supabase.from("project").update({ deleted: true }).eq("id", project.id);
    if (results.error) throw results.error;

    return NextResponse.json({ message: "Project has been deleted!" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
