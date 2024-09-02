import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(req, res) {
  try {
    // Authentication
    const access_token = req.headers.get("x-supabase-auth").split(" ")[0];
    const refresh_token = req.headers.get("x-supabase-auth").split(" ")[1];
    if (!access_token || !refresh_token) throw Error("You must be authorized to do this action!");
    const auth = await supabase.auth.setSession({ access_token, refresh_token });
    if (auth.error) throw auth.error;

    const projectId = uuidv4();
    const formData = await req.formData();
    const project = JSON.parse(formData.get("project"));
    const projectImage = formData.get("projectImage");

    const product = await stripe.products.create({
      name: project.title,
      default_price_data: {
        currency: "USD",
        unit_amount: project.price * 100,
      },
    });

    const imageId = uuidv4();
    let results = await supabase
      .from("project")
      .insert({ ...project, id: projectId, image_id: projectImage ? imageId : null, stripe_product: product });
    if (results.error) throw results.error;

    results = await supabase.storage
      .from("project-image")
      .upload(`${projectId}/${imageId}`, projectImage, { cacheControl: 3600, upsert: true });
    if (results.error) throw results.error;

    return NextResponse.json({ message: "Project created successfully!", projectId }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
