import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function PATCH(req, res) {
  try {
    // Authentication
    const access_token = req.headers.get("x-supabase-auth").split(" ")[0];
    const refresh_token = req.headers.get("x-supabase-auth").split(" ")[1];
    if (!access_token || !refresh_token) throw Error("You must be authorized to do this action!");
    const auth = await supabase.auth.setSession({ access_token, refresh_token });
    if (auth.error) throw auth.error;

    const formData = await req.formData();
    let project = JSON.parse(formData.get("project"));
    const projectImage = formData.get("projectImage");
    const oldImageId = formData.get("oldImageId");

    let results;
    if (oldImageId) {
      results = await supabase.storage.from("project-image").remove([`${project.id}/${oldImageId}`]);
      if (results.error) throw results.error;
    }

    if (projectImage) {
      const imageId = uuidv4();
      results = await supabase.storage
        .from("project-image")
        .upload(`${project.id}/${imageId}`, projectImage, { cacheControl: 3600, upsert: true });
      if (results.error) throw results.error;
      project["image_id"] = imageId;
    }

    results = await supabase.from("project").update(project).eq("id", project.id);
    if (results.error) throw results.error;

    return NextResponse.json({ message: "Project updated successfully!" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
