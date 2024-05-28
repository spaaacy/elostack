import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req, res) {
  try {
    // Authentication
    const auth = await supabase.auth.signInWithPassword({
      email: process.env.SUPABASE_ADMIN_EMAIL,
      password: process.env.SUPABASE_ADMIN_PASSWORD,
    });
    if (auth.error) throw auth.error;

    const { projectId } = res.params;
    const { data, error } = await supabase.from("member").select("*, user(*)").eq("project_id", projectId);
    if (error) throw error;
    return NextResponse.json({ members: data }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
