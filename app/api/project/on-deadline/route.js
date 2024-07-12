import { formatTime } from "@/utils/formatTime";
import { supabase } from "@/utils/supabase";
import { GenerateContentResponseHandler } from "@google-cloud/vertexai";
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
          await notifyMembers(project.user_ids[i], project.title, project.id, "project-deadline");
          sendEmail("d-2a66d155db7f4bbf94483e3e33c0995e", email, 26321, {
            project_title: project.title,
            project_id: project.id,
            username: project.member_usernames[i],
            deadline: `${formatTime(project.deadline)} UTC`,
          });
        });
        notifySlack(
          `Hey everyone! Just a reminder that your project is due on ${formatTime(
            project.deadline
          )} UTC. Good luck! <https://www.elostack.com/projects/${project.id}?sprints=true|View Tasks>`,
          project.slack_channel_id
        );
      } else if (new Date(project.current_sprint_deadline).getTime() === tomorrow.getTime()) {
        project.member_emails.forEach(async (email, i) => {
          await notifyMembers(project.user_ids[i], project.title, project.id, "sprint-deadline");
          sendEmail("d-47ec6ceaed55433bab47ab54dc510d47", email, 26321, {
            project_title: project.title,
            project_id: project.id,
            username: project.member_usernames[i],
            sprint_title: project.current_sprint_title,
            deadline: `${formatTime(project.current_sprint_deadline)} UTC`,
          });
        });
        notifySlack(
          `Hey everyone! Just a reminder that your next milestone is due on ${formatTime(
            project.deadline
          )} UTC. Good luck! <https://www.elostack.com/projects/${project.id}?sprints=true|View Tasks>`,
          project.slack_channel_id
        );
      }
    }

    // Assign tasks reminder
    for (let project of data) {
      if (new Date(project.sprint_updated_at).getTime() >= twentyFourHoursAgo.getTime() && project.current_sprint) {
        project.member_emails.forEach(async (email, i) => {
          await notifyMembers(project.user_ids[i], project.title, project.id, "assign-task");
          sendEmail("d-96ce1ec66aab40789841878ef03c8f50", email, 26337, {
            project_title: project.title,
            project_id: project.id,
            username: project.member_usernames[i],
            sprint_title: project.current_sprint_title,
          });
        });
        notifySlack(
          `Hey everyone! Congrats on finishing a sprint! Don't forget to assign yourself to the next sprints tasks! <https://www.elostack.com/projects/${project.id}?sprints=true|Assign Tasks>`,
          project.slack_channel_id
        );
      }
    }

    return NextResponse.json({ message: "Deadline endpoint successfully executed!" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

const notifyMembers = async (userId, projectTitle, projectId, type) => {
  try {
    const { error } = await supabase.from("notification").insert({
      user_id: userId,
      payload: { projectTitle, projectId },
      type,
    });
    if (error) throw error;
  } catch (error) {
    console.error(error);
  }
};

const sendEmail = async (templateId, email, asmGroupId, dynamicTemplateData) => {
  const message = {
    from: { email: "aakifmohamed@elostack.com", name: "EloStack" },
    template_id: templateId,
    asm: {
      groupId: asmGroupId,
    },
    personalizations: [
      {
        to: [{ email }],
        dynamic_template_data: dynamicTemplateData,
      },
    ],
  };

  try {
    await sgMail.send(message);
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error);
  }
};

const notifySlack = async (text, channel) => {
  if (!channel) return;
  try {
    const response = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.SLACK_APP_OAUTH_TOKEN}` },
      body: JSON.stringify({
        channel,
        blocks: [{ type: "section", text: { type: "mrkdwn", text } }],
      }),
    });
    const result = await response.json();
    if (result.ok === false) {
      throw result.error;
    }
  } catch (error) {
    console.error(error);
  }
};
