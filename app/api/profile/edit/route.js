import { supabase } from "@/utils/supabase";
import { preloadFont } from "next/dist/server/app-render/entry-base";
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
    const oldImageId = formData.get("oldImageId");
    const userId = formData.get("userId");
    const username = formData.get("username");

    const newProfile = { username };

    if (oldImageId && profilePicture) {
      newProfile["image_id"] = uuidv4();
      let results = await supabase.storage.from("profile-picture").remove([`${userId}/${oldImageId}`]);
      if (results.error) throw results.error;
      results = await supabase.storage
        .from("profile-picture")
        .upload(`${userId}/${newProfile.image_id}`, profilePicture, { cacheControl: 3600, upsert: true });
      if (results.error) throw results.error;
    }

    const { error } = await supabase.from("profile").update(newProfile).eq("user_id", userId);
    if (error) throw error;

    return NextResponse.json({ message: "Profile has been edited!" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
