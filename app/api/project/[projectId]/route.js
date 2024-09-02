import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req, res) {
  try {
    const { projectId } = res.params;
    const { data, error } = await supabase.rpc("fetch_project_with_member_count", { p_project_id: projectId });
    if (error) throw error;
    return NextResponse.json({ project: data }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
