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

    const { userId, projectId, projectTitle, username } = await req.json();
    const { data, error } = await supabase.rpc("add_member", { p_user_id: userId, p_project_id: projectId });
    if (error) throw error;

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    if (data[0].is_full && data[0].previous_status === "Just created") {
      for (const email of data[0].email) {
        const message = {
          from: { email: "aakifmohamed@elostack.com", name: "EloStack" },
          template_id: "d-2d849ded45cc434e8b872eaf34d79629",
          asm: {
            groupId: 26311,
          },
          personalizations: [
            {
              to: [{ email }],
              dynamic_template_data: {
                project_title: projectTitle,
                project_id: projectId,
                username,
              },
            },
          ],
        };

        try {
          await sgMail.send(message);
        } catch (error) {
          console.error(`Error sending email to ${email}:`, error);
        }
      }

      let results = await supabase.rpc("update_project_deadline", {
        p_project_id: projectId,
      });
      if (results.error) throw results.error;
      results = await supabase.rpc("update_sprint_deadlines", { p_project_id: projectId });
      if (results.error) throw results.error;
    } else {
      data[0].email.forEach(async (email, i) => {
        let message;
        if (data[0].username[i] !== username) {
          message = {
            from: { email: "aakifmohamed@elostack.com", name: "EloStack" },
            template_id: "d-ca07c41d02634540985b88c473c1a7f6",
            asm: {
              groupId: 26329,
            },
            personalizations: [
              {
                to: [{ email }],
                dynamic_template_data: {
                  project_title: projectTitle,
                  project_id: projectId,
                  username,
                },
              },
            ],
          };
        } else {
          message = {
            from: { email: "aakifmohamed@elostack.com", name: "EloStack" },
            template_id: "d-2248e75fa01349e19e5046b5fdb512cf",
            asm: {
              groupId: 26329,
            },
            personalizations: [
              {
                to: [{ email }],
                dynamic_template_data: {
                  project_title: projectTitle,
                  project_id: projectId,
                  username,
                },
              },
            ],
          };
        }
        try {
          await sgMail.send(message);
        } catch (error) {
          console.error(`Error sending email to ${email}:`, error);
        }
      });
    }

    return NextResponse.json({ message: "Member added successfully!" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
