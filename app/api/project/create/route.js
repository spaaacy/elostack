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

    const project = await req.json();
    const projectId = uuidv4();

    let results = await supabase.from("project").insert({ ...project, id: projectId });
    if (results.error) throw results.error;

    // results = await supabase.from("member").insert({ user_id: project.leader, project_id: projectId });
    results = await supabase
      .from("member")
      .insert({ user_id: "256749ce-f3ff-4d61-bca6-a6c0a7ffce20", project_id: projectId });
    if (results.error) throw results.error;

    return NextResponse.json({ message: "Project created successfully!" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
