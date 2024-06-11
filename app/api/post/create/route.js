import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req, res) {
  try {
    // Authentication
    const access_token = req.headers.get("x-supabase-auth").split(" ")[0];
    const refresh_token = req.headers.get("x-supabase-auth").split(" ")[1];
    if (!access_token || !refresh_token)
      throw Error("You must be authorized to do this action!");
    const auth = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if (auth.error) throw auth.error;

    const requestData = await req.json();
    let results = await supabase.from("post").insert({
      id: requestData.postId,
      user_id: requestData.userId,
      project_id: requestData.projectId,
      content: requestData.content,
      public: requestData.isPublic,
    });
    if (results.error) throw results.error;
    if (requestData.projectId && requestData.projectTitle) {
      results = await supabase.rpc("create_notifications", {
        p_user_id: requestData.userId,
        p_payload: { projectTitle: requestData.projectTitle, projectId: requestData.projectId },
        p_type: "post",
      });
      if (results.error) throw results.error;
    }
    return NextResponse.json(
      { message: "Post created successfully!" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
