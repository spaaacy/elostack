export const dynamic = "force-dynamic";

import { supabase } from "@/utils/supabase";
import { NextResponse } from "next/server";

export async function POST(req, res) {
  try {
    const { pageNumber } = await req.json();

    let results = await supabase.rpc("get_projects_with_total_members", {
      p_page_number: pageNumber,
    });
    if (results.error) throw results.error;
    const projects = results.data;

    results = await supabase.rpc("get_projects_count");
    if (results.error) throw results.error;
    const count = results.data;

    return NextResponse.json({ projects, count }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
