import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req, res) {
  try {
    // Authentication
    const access_token = req.headers.get("x-supabase-auth").split(" ")[0];
    const refresh_token = req.headers.get("x-supabase-auth").split(" ")[1];
    if (!access_token || !refresh_token) throw Error("You must be authorized to do this action!");
    const auth = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if (auth.error) throw auth.error;

    const requestData = await req.json();
    const commentId = uuidv4();

    let results = await supabase.from("comment").insert({
      id: commentId,
      post_id: requestData.postId,
      user_id: requestData.userId,
      comment: requestData.comment,
    });
    if (results.error) throw results.error;
    if (requestData.postUserId !== requestData.userId) {
      let payload = { postId: requestData.postId };
      if (requestData.projectId && requestData.projectTitle) {
        payload["projectId"] = requestData.projectId;
        payload["projectTitle"] = requestData.projectTitle;
      }
      results = await supabase.from("notification").insert({
        user_id: requestData.postUserId,
        payload,
        type: "comment",
      });
      if (results.error) throw results.error;
    }
    return NextResponse.json({ message: "Post created successfully!", commentId }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
