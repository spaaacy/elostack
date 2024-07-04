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
    const yesterday = new Date(today);
    yesterday.setUTCDate(tomorrow.getUTCDate() - 1);
    const twentyFourHoursAgo = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), today.getUTCHours() - 24)
    );

    // Email deadline notifications
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

    // Assign tasks reminder
    for (let project of data) {
      if (new Date(project.sprint_updated_at).getTime() >= twentyFourHoursAgo.getTime() && project.current_sprint) {
        project.member_emails.forEach(async (email, i) => {
          const message = {
            from: { email: "aakifmohamed@elostack.com", name: "EloStack" },
            template_id: "d-96ce1ec66aab40789841878ef03c8f50",
            asm: {
              groupId: 26337,
            },
            personalizations: [
              {
                to: [{ email }],
                dynamic_template_data: {
                  project_title: project.title,
                  project_id: project.id,
                  username: project.member_usernames[i],
                  sprint_title: project.current_sprint_title,
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

    // Mark blackpoints
    for (let project of data) {
      if (project.id !== "6d8b9e5c-0494-4893-9248-14554caf3b90") continue;
      if (
        today.getTime() !== new Date(project.current_sprint_deadline).getTime() &&
        today.getTime() !== new Date(project.deadline).getTime()
      ) {
        continue;
      }
      let contributions = {};
      project.user_ids.forEach((user_id, i) => {
        contributions[user_id] = { total: 0, email: project.member_emails[i], username: project.member_usernames[i] };
        project.current_tasks.forEach((task) => {
          if (user_id === task.assignee && task.complete === true)
            contributions[user_id]["total"] = contributions[user_id]["total"] + 1;
        });
      });
      for (let userId in contributions) {
        if (contributions[userId]["total"] === 0) {
          const { data, error } = await supabase.rpc("increment_blackpoint", {
            p_user_id: userId,
            p_project_id: project.id,
          });
          if (error) throw error;
          // Member hit 5 blackpoints
          let message;
          if (data >= 3) {
            // Send notification
            const { error } = await supabase.from("notification").insert({
              user_id: userId,
              payload: { projectTitle: project.title, projectId: project.id },
              type: "member-remove",
            });
            if (error) throw error;

            message = {
              from: { email: "aakifmohamed@elostack.com", name: "EloStack" },
              template_id: "d-6dfdcb11aab64c75ab34d01c218b89b7",
              asm: {
                groupId: 26311,
              },
              personalizations: [
                {
                  to: [{ email: contributions[userId]["email"] }],
                  dynamic_template_data: {
                    project_title: project.title,
                    username: contributions[userId]["username"],
                  },
                },
              ],
            };
          } else {
            message = {
              from: { email: "aakifmohamed@elostack.com", name: "EloStack" },
              template_id: "d-2eb1e2dfb7c94dc8bc557ef686932fba",
              asm: {
                groupId: 26350,
              },
              personalizations: [
                {
                  to: [{ email: contributions[userId]["email"] }],
                  dynamic_template_data: {
                    project_title: project.title,
                    username: contributions[userId]["username"],
                    project_id: project.id,
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
        }
      }
    }

    return NextResponse.json({ message: "Deadline endpoint successfully executed!" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
