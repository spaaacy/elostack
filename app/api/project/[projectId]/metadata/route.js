import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req, res) {
  try {
    const { projectId } = res.params;
    const { data, error } = await supabase.from("project").select("title").eq("id", projectId).single();
    if (error) throw error;
    return NextResponse.json({ title: data.title }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
