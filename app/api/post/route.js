import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req, res) {
  try {
    const { pageNumber } = await req.json();

    const { data, error } = await supabase.rpc("fetch_posts", { p_page_number: pageNumber, p_page_size: 5 });
    if (error) throw error;
    return NextResponse.json({ posts: data }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
