import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req, res) {
  try {
    const requestData = await req.json();
    let prompt;
    if (!requestData.imagePrompt) {
      prompt = `Design a logo that is screen-print, flat, vector. This is the title for which the logo is to be designed: ${requestData.title} `;
    } else prompt = requestData.imagePrompt;
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
      }),
    });
    const result = await response.json();
    console.log(result);
    return NextResponse.json({ imageUrl: result.data[0].url }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
