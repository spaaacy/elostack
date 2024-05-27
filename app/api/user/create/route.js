import { supabase } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(req, res) {
  try {
    // Authentication
    const auth = await supabase.auth.signInWithPassword({
      email: process.env.SUPABASE_ADMIN_EMAIL,
      password: process.env.SUPABASE_ADMIN_PASSWORD,
    });
    if (auth.error) throw auth.error;

    // Create Stripe customer first
    const user = await req.json();
    let response;
    response = await supabase
      .from("user")
      .insert({ user_id: user.user_id, email: user.email, username: user.username });
    if (response.error) throw response.error;

    const customer = await stripe.customers.create({
      name: user.username,
      email: user.email,
    });

    console.log(customer);

    response = await supabase.from("user").update({ stripe_customer_id: customer.id }).eq("user_id", user.user_id);
    if (response.error) throw response.error;

    return NextResponse.json({ message: "User created successfully!" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
