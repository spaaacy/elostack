export const dynamic = "force-dynamic";

import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req, res) {
  try {
    const { userId, pageNumber } = await req.json();

    let results = await supabase.rpc("get_projects_by_user_id", { p_user_id: userId , p_page_number: pageNumber});
    if (results.error) throw results.error;
    const projects = results.data

    results = await supabase.rpc("get_projects_count_by_user_id", {p_user_id: userId});
    if (results.error) throw results.error;
    const count = results.data;
    
    return NextResponse.json({ projects, count }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
