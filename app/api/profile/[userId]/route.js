import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req, res) {
  try {
    const { userId } = res.params;
    const { data, error } = await supabase.from("profile").select().eq("user_id", userId).single();

    if (error) throw error;
    return NextResponse.json({ profile: data }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
