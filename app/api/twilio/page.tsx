
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TwilioClient() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCall = async () => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/twilio/token", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get token");
      }

      const { token } = await response.json();

      const callResponse = await fetch("/api/calls/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: phoneNumber,
          notes: "Call initiated from Twilio client",
        }),
      });

      if (!callResponse.ok) {
        const error = await callResponse.json();
        throw new Error(error.error || "Failed to initiate call");
      }

      toast({
        title: "Success",
        description: "Call initiated successfully",
      });
    } catch (error) {
      console.error("Call error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to make call",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Make a Call</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
        <Button 
          onClick={handleCall} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Initiating Call..." : "Call Now"}
        </Button>
      </CardContent>
    </Card>
  );
}
