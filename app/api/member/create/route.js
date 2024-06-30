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
      const recipients = data.map((item) => ({ email: item.email }));
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const message = {
        from: { email: "aakifmohamed@elostack.com", name: "EloStack" },
        template_id: "d-2d849ded45cc434e8b872eaf34d79629",
        asm: {
          groupId: 26311,
        },
        personalizations: [
          {
            to: recipients,
            dynamic_template_data: {
              project_title: projectTitle,
              project_id: projectId,
            },
          },
        ],
      };
      await sgMail.send(message);
      console.log("Emails sent!");
    }

    return NextResponse.json({ message: "Member added successfully!" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
