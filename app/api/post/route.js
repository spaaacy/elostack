import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req, res) {
  try {
    const { pageNumber } = await req.json();

    let results = await supabase.rpc("fetch_posts", { p_page_number: pageNumber, p_page_size: 5 });
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
      results.data.forEach((image) => imageIds.push(image.name));
      posts = posts.map((mapPost) => (post === mapPost ? { ...mapPost, imageIds } : mapPost));
    }

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
