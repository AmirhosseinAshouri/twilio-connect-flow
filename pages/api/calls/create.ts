import { NextApiRequest, NextApiResponse } from "next";
import twilio from "twilio";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { callId, to, notes } = req.body;
    console.log("Received Call Request:", { callId, to, notes });

    // Check Authorization Token
    const authHeader = req.headers.authorization;
    console.log("Auth Header:", authHeader);
    
    if (!authHeader) return res.status(401).json({ error: "Unauthorized - Missing Token" });

    const token = authHeader.replace("Bearer ", "");
    const { data: user, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.log("Supabase Auth Error:", userError);
      return res.status(401).json({ error: "Unauthorized - Invalid Token" });
    }

    console.log("User Authenticated:", user);

    // Fetch Twilio Settings from Supabase
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("twilio_account_sid, twilio_auth_token, twilio_phone_number")
      .eq("user_id", user.id)
      .single();

    console.log("Fetched Twilio Settings:", settings);
    console.log("Supabase Query Error:", settingsError);

    if (!settings || settingsError) {
      return res.status(500).json({ error: "Twilio settings not found in database" });
    }

    // Initialize Twilio Client
    const client = twilio(settings.twilio_account_sid, settings.twilio_auth_token);

    // Create Call
    const call = await client.calls.create({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/twiml`,
      to,
      from: settings.twilio_phone_number,
      statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/status`,
      statusCallbackEvent: ["completed"],
    });

    console.log("Twilio Call Created:", call);

    // Update Call in Database
    await supabase.from("calls").update({ twilio_sid: call.sid, status: "initiated" }).eq("id", callId);

    return res.json({ success: true, sid: call.sid });
  } catch (error) {
    console.error("Twilio Call Creation Error:", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Failed to create call" });
  }
}
