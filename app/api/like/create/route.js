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

    const { userId, postId } = await req.json();
    let results = await supabase.from("like").insert({ user_id: userId, post_id: postId });
    if (results.error) throw results.error;
    results = await supabase.rpc("increment_likes", {p_post_id: postId})
    if (results.error) throw results.error;


    return NextResponse.json({ message: "Like created successfully!" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
