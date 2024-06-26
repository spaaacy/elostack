import { supabase } from "@/utils/supabase";
import { Octokit } from "@octokit/core";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req, res) {
  try {
    // Authentication
    const access_token = req.headers.get("x-supabase-auth").split(" ")[0];
    const refresh_token = req.headers.get("x-supabase-auth").split(" ")[1];
    if (!access_token || !refresh_token) throw Error("You must be authorized to do this action!");
    const auth = await supabase.auth.setSession({ access_token, refresh_token });
    if (auth.error) throw auth.error;

    const { code, userId } = await req.json();
    if (!code) throw Error("Code not provided!");

    const response = await fetch(
      `https://github.com/login/oauth/access_token?` +
        new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: "http://localhost:3000/account-settings?github_oauth=true",
        }),
      {
        method: "POST",
      }
    );
    if (response.ok) {
      const text = await response.text();
      const params = new URLSearchParams(text);
      const accessToken = params.get("access_token");

      const octokit = new Octokit({
        auth: accessToken,
      });

      const userResponse = await octokit.request("GET /user", {
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });

      let results = await supabase.from("user").update({ github_access_token: accessToken }).eq("user_id", userId);
      if (results.error) throw results.error;
      results = await supabase
        .from("profile")
        .update({ github_username: userResponse.data.login })
        .eq("user_id", userId);
      if (results.error) throw results.error;
      return NextResponse.json({ message: "GitHub connected successfully!" }, { status: 200 });
    } else {
      throw new Error(`Error reaching GitHub! Status: ${response.status}`);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
