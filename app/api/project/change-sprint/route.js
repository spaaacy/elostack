import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req, res) {
  try {
    // Supabase Authentication
    const auth = await supabase.auth.signInWithPassword({
      email: process.env.SUPABASE_ADMIN_EMAIL,
      password: process.env.SUPABASE_ADMIN_PASSWORD,
    });
    if (auth.error) throw auth.error;

    const { sprintId, projectId } = await req.json();
    const { error } = await supabase.rpc("change_sprint", {
      p_sprint_id: sprintId,
      p_project_id: projectId,
    });
    if (error) throw error;

    return NextResponse.json({ message: "Current sprint changed successfully!" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
