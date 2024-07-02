import { formatTime } from "@/utils/formatTime";
import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";
const sgMail = require("@sendgrid/mail");

export async function POST(req, res) {
  try {
    // Cron Authentication
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      if (authHeader.split(" ")[1] !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Supabase Authentication
    const auth = await supabase.auth.signInWithPassword({
      email: process.env.SUPABASE_ADMIN_EMAIL,
      password: process.env.SUPABASE_ADMIN_PASSWORD,
    });
    if (auth.error) throw auth.error;

    const { data, error } = await supabase.rpc("get_projects_with_emails");
    if (error) throw error;

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    for (let project of data) {
      if (new Date(project.deadline).getTime() === tomorrow.getTime()) {
        project.member_emails.forEach(async (email, i) => {
          const message = {
            from: { email: "aakifmohamed@elostack.com", name: "EloStack" },
            template_id: "d-2a66d155db7f4bbf94483e3e33c0995e",
            asm: {
              groupId: 26321,
            },
            personalizations: [
              {
                to: [{ email }],
                dynamic_template_data: {
                  project_title: project.title,
                  project_id: project.id,
                  username: project.member_usernames[i],
                  deadline: `${formatTime(project.deadline)} UTC`,
                },
              },
            ],
          };

          try {
            await sgMail.send(message);
            console.log(`Email sent to ${email}`);
          } catch (error) {
            console.error(`Error sending email to ${email}:`, error);
          }
        });
      } else if (new Date(project.current_sprint_deadline).getTime() === tomorrow.getTime()) {
        project.member_emails.forEach(async (email, i) => {
          const message = {
            from: { email: "aakifmohamed@elostack.com", name: "EloStack" },
            template_id: "d-47ec6ceaed55433bab47ab54dc510d47",
            asm: {
              groupId: 26321,
            },
            personalizations: [
              {
                to: [{ email }],
                dynamic_template_data: {
                  project_title: project.title,
                  project_id: project.id,
                  username: project.member_usernames[i],
                  sprint_title: project.current_sprint_title,
                  deadline: `${formatTime(project.current_sprint_deadline)} UTC`,
                },
              },
            ],
          };

          try {
            await sgMail.send(message);
          } catch (error) {
            console.error(`Error sending email to ${email}:`, error);
          }
        });
      }
    }

    return NextResponse.json({ message: "Deadline endpoint successfully executed!" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
