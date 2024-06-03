export const dynamic = "force-dynamic";

import { supabase } from "@/utils/supabase";
import { NextResponse } from "next/server";

export async function GET(req, res) {
  try {
    // Authentication
    const auth = await supabase.auth.signInWithPassword({
      email: process.env.SUPABASE_ADMIN_EMAIL,
      password: process.env.SUPABASE_ADMIN_PASSWORD,
    });
    if (auth.error) throw auth.error;

    const { data, error } = await supabase.rpc("get_projects_with_total_members");
    if (error) throw error;
    return NextResponse.json({ projects: data }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
