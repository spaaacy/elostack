import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req, res) {
  try {
    // Authentication
    const auth = await supabase.auth.signInWithPassword({
      email: process.env.SUPABASE_ADMIN_EMAIL,
      password: process.env.SUPABASE_ADMIN_PASSWORD,
    });
    if (auth.error) throw auth.error;

    const { userId, projectId, memberId } = await req.json();
    let results = await supabase.rpc("vote_kick", {
      p_user_id: userId,
      p_project_id: projectId,
      p_member_id: memberId,
    });
    if (results.error) throw results.error;

    return NextResponse.json({ message: "Vote kick has been created!" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
