
import { NextResponse } from "next/server";
import { supabase } from "@/integrations/supabase/client";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const callSid = formData.get('CallSid');
    const callStatus = formData.get('CallStatus');
    const callDuration = formData.get('CallDuration');

    console.log("Call status update:", {
      callSid,
      callStatus,
      callDuration
    });

    if (!callSid) {
      return NextResponse.json({ error: "Missing CallSid" }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("calls")
      .update({
        status: callStatus?.toString(),
        duration: parseInt(callDuration?.toString() || "0"),
      })
      .eq("twilio_sid", callSid);

    if (updateError) {
      console.error("Call status update error:", updateError);
      return NextResponse.json({ error: "Failed to update call status" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Status callback error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to process status callback" 
    }, { status: 500 });
  }
}
