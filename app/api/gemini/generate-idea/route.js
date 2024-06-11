import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req, res) {
  try {
    const { ideaPrompt } = await req.json();
    const prompt = `Generate an idea for a software project based on this entry:
${ideaPrompt}

Return the answer as a JSON object with these keys:
title, description, teamSize, durationLength, durationType, technologies

durationType can only be "week" or "day" and technologies must be an array. teamSized must be a fixed number.
`;
    let attempts = 0;
    let idea;
    do {
      try {
        attempts++;
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
            }),
          }
        );
        const result = await response.json();
        const rawString = result.candidates[0].content.parts[0].text;
        const cleanedString = rawString.replace(/```json/, "").replace(/```/, "");
        idea = JSON.parse(cleanedString);
      } catch (error) {
        console.error(error);
      }
    } while (!idea && attempts < 3);
    return NextResponse.json({ idea }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
