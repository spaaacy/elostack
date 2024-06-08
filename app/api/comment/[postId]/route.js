import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req, res) {
  try {
    const { postId } = res.params;
    const { pageNumber, pageSize } = await req.json();
    const { data, error } = await supabase.rpc("get_comments", {
      p_post_id: postId,
      p_page_number: pageNumber,
      p_page_size: pageSize,
    });
    if (error) throw error;
    return NextResponse.json({ comments: data }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
