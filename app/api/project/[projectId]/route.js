import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req, res) {
  try {
    const { projectId } = res.params;
    const { data, error } = await supabase
      .from("project")
      .select("*, sprint!project_current_sprint_fkey(*)")
      .eq("id", projectId)
      .single();
    if (error) throw error;
    return NextResponse.json({ project: data }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
