import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req, res) {
  try {
    // Authentication
    const access_token = req.headers.get("x-supabase-auth").split(" ")[0];
    const refresh_token = req.headers.get("x-supabase-auth").split(" ")[1];
    if (!access_token || !refresh_token) throw Error("You must be authorized to do this action!");
    const auth = await supabase.auth.setSession({ access_token, refresh_token });
    if (auth.error) throw auth.error;

    const { title, projectId, previousSprintId } = await req.json();
    const sprintId = uuidv4();
    let results = await supabase
      .from("sprint")
      .insert({ title, project_id: projectId, id: sprintId, previous_sprint_id: previousSprintId });
    if (results.error) throw results.error;
    if (previousSprintId) {
      results = await supabase.from("sprint").update({ next_sprint_id: sprintId }).eq("id", previousSprintId);
      if (results.error) throw results.error;
    }

    return NextResponse.json({ message: "Sprint created successfully!", sprintId }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
