import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

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

    const { projectId } = res.params;
    const { pageNumber } = await req.json();
    let results = await supabase.rpc("fetch_posts", {
      p_page_number: pageNumber,
      p_page_size: 5,
      p_project_id: projectId,
    });
    if (results.error) throw results.error;
    let posts = results.data;

    for (let post of results.data) {
      if (!post.images) continue;
      const results = await supabase.storage.from("post-image").list(post.id, {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });
      if (results.error) throw results.error;

      let imageIds = [];
      for (let image of results.data) {
        imageIds.push(image.name)
      }
      posts = posts.map((mapPost) => (post === mapPost ? { ...mapPost, imageIds } : mapPost));
    }

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
