export const dynamic = "force-dynamic";

import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req, res) {
  try {
    const { userId } = await req.json();
    const { data, error } = await supabase.rpc("get_projects_by_user_id", { p_user_id: userId });
    if (error) throw error;
    return NextResponse.json({ projects: data }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
