import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req, res) {
  try {
    const { projectId } = res.params;
    console.log(projectId)
    const { data, error } = await supabase.from("member").select().eq("project_id", projectId);
    if (error) throw error;
    let members = [];
    for (let member of data) {
      const { data, error } = await supabase
        .from("profile")
        .select()
        .eq("user_id", member.user_id)
        .single();
      if (error) throw error;
      member["profile"] = data;
      members.push(member);
    }

    return NextResponse.json({ members }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
