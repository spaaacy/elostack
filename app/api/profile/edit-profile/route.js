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
    const profilePicture = formData.get("profilePicture");
    const userId = formData.get("userId");
    const oldImageId = formData.get("imageId");

    let results = await supabase.storage.from("profile-picture").remove([`${userId}/${oldImageId}`]);
    if (results.error) throw results.error;

    const imageId = uuidv4();
    results = await supabase.from("profile").update({ image_id: imageId }).eq("user_id", userId);
    if (results.error) throw results.error;

    results = await supabase.storage
      .from("profile-picture")
      .upload(`${userId}/${imageId}`, profilePicture, { cacheControl: 3600, upsert: true });
    if (results.error) throw results.error;

    return NextResponse.json({ message: "Profile has been edited!" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
