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

    const formData = await req.formData();
    const requestData = JSON.parse(formData.get("requestBody"));
    const totalImages = formData.get("totalImages");

    const postId = uuidv4();

    // Create post
    let results = await supabase.from("post").insert({
      id: postId,
      user_id: requestData.userId,
      project_id: requestData.projectId,
      content: requestData.content,
      public: requestData.isPublic,
    });
    if (results.error) throw results.error;

    // Upload images
    let imageIds = [];
    for (let i = 0; i < totalImages; i++) {
      const image = formData.get(`images[${i}]`);
      const imageId = uuidv4();
      imageIds.push(imageId);
      const { error } = await supabase.storage
        .from("post-image")
        .upload(`${postId}/${imageId}`, image, { cacheControl: 3600, upsert: true });
      if (error) throw error;
    }

    // Create notification
    if (requestData.projectId && requestData.projectTitle) {
      results = await supabase.rpc("create_notifications", {
        p_user_id: requestData.userId,
        p_payload: { projectTitle: requestData.projectTitle, projectId: requestData.projectId },
        p_type: "post",
      });
      if (results.error) throw results.error;
    }

    return NextResponse.json({ message: "Post created successfully!", postId, imageIds }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
