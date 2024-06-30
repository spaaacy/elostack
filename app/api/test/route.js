const sgMail = require("@sendgrid/mail");

import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req, res) {
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      from: { email: "aakifmohamed@elostack.com", name: "EloStack" },
      template_id: "d-2d849ded45cc434e8b872eaf34d79629",
      asm: {
        groupId: 26311,
      },
      personalizations: [
        {
          to: [{ email: "elostackinc@gmail.com" }, { email: "aakifmohamed@elostack.com" }],
          dynamic_template_data: {
            project_title: "Social Media Aggregator & Analytics Dashboard",
            project_id: "6d8b9e5c-0494-4893-9248-14554caf3b90",
          },
        },
      ],
    };

    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
