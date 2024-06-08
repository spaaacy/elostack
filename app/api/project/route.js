export const dynamic = "force-dynamic";

import { supabase } from "@/utils/supabase";
import { NextResponse } from "next/server";

export async function GET(req, res) {
  try {
    const { data, error } = await supabase.rpc("get_projects_with_total_members");
    if (error) throw error;
    return NextResponse.json({ projects: data }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
