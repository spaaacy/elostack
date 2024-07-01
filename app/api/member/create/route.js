import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";
const sgMail = require("@sendgrid/mail");

export async function POST(req, res) {
  try {
    // Authentication
    const auth = await supabase.auth.signInWithPassword({
      email: process.env.SUPABASE_ADMIN_EMAIL,
      password: process.env.SUPABASE_ADMIN_PASSWORD,
    });
    if (auth.error) throw auth.error;

    const { userId, projectId, projectTitle } = await req.json();
    const { data, error } = await supabase.rpc("add_member", { p_user_id: userId, p_project_id: projectId });
    if (error) throw error;

    // Project is now full
    if (data.length > 0) {
      console.log("Sending emails...");
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      // Send individual emails to each recipient
      for (const item of data) {
        const message = {
          from: { email: "aakifmohamed@elostack.com", name: "EloStack" },
          to: { email: item.email },
          template_id: "d-2d849ded45cc434e8b872eaf34d79629",
          asm: {
            groupId: 26311,
          },
          personalizations: [
            {
              to: [{ email: item.email }],
              dynamic_template_data: {
                project_title: projectTitle,
                project_id: projectId,
              },
            },
          ],
        };

        try {
          await sgMail.send(message);
          console.log(`Email sent to ${item.email}`);
        } catch (error) {
          console.error(`Error sending email to ${item.email}:`, error);
        }
      }

      console.log("All emails sent!");

      let results = await supabase.rpc("update_project_deadline", {
        p_project_id: projectId,
      });
      if (results.error) throw results.error;
      results = await supabase.rpc("update_sprint_deadlines", { p_project_id: projectId });
      if (results.error) throw results.error;
    }

    return NextResponse.json({ message: "Member added successfully!" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
